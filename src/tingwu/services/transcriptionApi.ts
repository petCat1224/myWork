import {
  TINGWU_API_BASE,
  TINGWU_SSE_PATH,
  TINGWU_UPLOAD_PATH,
  USE_REAL_API,
  resolvePath,
} from '../config/api';
import type { TingwuTranscriptSegment } from '../types';

/**
 * 流式转写事件（SSE / Fetch 统一结构）。
 */
export interface TranscriptStreamEvent {
  type: 'segment' | 'done' | 'error' | 'status' | 'overview' | 'meta';
  segment?: TingwuTranscriptSegment;
  message?: string;
  status?: string;
  overview?: string;
  recordId?: string;
}

/** Mock 演示数据 */
const MOCK_STREAM_TEXT = [
  {
    speakerId: 'sp-1',
    speakerName: '说话人 1',
    text: '大家好，欢迎使用通义听悟风格的实时转写演示。',
    startTime: 0,
    endTime: 5,
  },
  {
    speakerId: 'sp-2',
    speakerName: '说话人 2',
    text: '配置 Node 中间层后，将调用阿里云 DashScope Paraformer 转写。',
    startTime: 5,
    endTime: 11,
  },
];

async function* mockFetchTranscriptionStream(
  signal?: AbortSignal,
): AsyncGenerator<TranscriptStreamEvent> {
  for (let i = 0; i < MOCK_STREAM_TEXT.length; i += 1) {
    if (signal?.aborted) return;
    await new Promise((resolve) => { setTimeout(resolve, 600); });
    const item = MOCK_STREAM_TEXT[i];
    yield {
      type: 'segment',
      segment: {
        id: `stream-seg-${i}`,
        ...item,
      },
    };
  }
  yield { type: 'done' };
}

function parseStreamLine(line: string): TranscriptStreamEvent | null {
  const trimmed = line.trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed) as TranscriptStreamEvent;
  } catch {
    return null;
  }
}

/**
 * 通过 Fetch ReadableStream 上传并流式转写。
 * @param file - 音频文件
 * @param recordId - 前端记录 ID（与 SSE 订阅关联）
 * @param signal - 中止信号
 */
export async function* streamTranscriptionViaFetch(
  file: File,
  recordId?: string,
  signal?: AbortSignal,
): AsyncGenerator<TranscriptStreamEvent> {
  if (!USE_REAL_API) {
    yield* mockFetchTranscriptionStream(signal);
    return;
  }

  const url = `${TINGWU_API_BASE}${TINGWU_UPLOAD_PATH}`;
  const formData = new FormData();
  formData.append('file', file);
  if (recordId) {
    formData.append('recordId', recordId);
  }

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
    signal,
  });

  if (!response.ok) {
    const errText = await response.text();
    yield { type: 'error', message: `转写请求失败: ${response.status} ${errText}` };
    return;
  }

  if (!response.body) {
    yield { type: 'error', message: '响应体不可读' };
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      const event = parseStreamLine(line);
      if (event) yield event;
    }
  }

  if (buffer.trim()) {
    const event = parseStreamLine(buffer);
    if (event) yield event;
  }
}

/**
 * 通过 EventSource 订阅转写进度。
 */
export function subscribeTranscriptionViaSSE(
  recordId: string,
  onEvent: (event: TranscriptStreamEvent) => void,
  onError?: (message: string) => void,
): () => void {
  if (!USE_REAL_API) {
    let index = 0;
    const timer = window.setInterval(() => {
      if (index >= MOCK_STREAM_TEXT.length) {
        onEvent({ type: 'done' });
        window.clearInterval(timer);
        return;
      }
      const item = MOCK_STREAM_TEXT[index];
      onEvent({
        type: 'segment',
        segment: {
          id: `sse-seg-${index}`,
          ...item,
        },
      });
      index += 1;
    }, 700);
    return () => window.clearInterval(timer);
  }

  const path = resolvePath(TINGWU_SSE_PATH, recordId);
  const url = `${TINGWU_API_BASE}${path}`;
  const source = new EventSource(url);

  source.addEventListener('segment', (e) => {
    try {
      const segment = JSON.parse((e as MessageEvent).data) as TingwuTranscriptSegment;
      onEvent({ type: 'segment', segment });
    } catch {
      onError?.('SSE segment 解析失败');
    }
  });

  source.addEventListener('done', () => {
    onEvent({ type: 'done' });
    source.close();
  });

  source.addEventListener('error', (e) => {
    try {
      const data = JSON.parse((e as MessageEvent).data);
      onError?.(data.message || 'SSE 转写失败');
    } catch {
      onError?.('SSE 连接异常');
    }
    source.close();
  });

  source.onerror = () => {
    onError?.('SSE 连接异常');
    source.close();
  };

  return () => source.close();
}

export async function consumeTranscriptionStream(
  generator: AsyncGenerator<TranscriptStreamEvent>,
  onEvent: (event: TranscriptStreamEvent) => void,
  signal?: AbortSignal,
): Promise<void> {
  for await (const event of generator) {
    if (signal?.aborted) return;
    onEvent(event);
    if (event.type === 'error' || event.type === 'done') return;
  }
}
