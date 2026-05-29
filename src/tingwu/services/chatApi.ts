import { TINGWU_API_BASE, USE_REAL_API } from '../config/api';

/**
 * 流式问答事件。
 */
export interface ChatStreamEvent {
  type: 'chunk' | 'done' | 'error';
  content?: string;
  message?: string;
}

/**
 * 调用 Node 中间层 Qwen 流式问答。
 * @param question - 用户问题
 * @param context - 听记上下文
 * @param onChunk - 文本块回调
 * @param signal - 中止信号
 */
export async function streamChatViaFetch(
  question: string,
  context: string,
  onChunk: (text: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  if (!USE_REAL_API) {
    const mock = `### 回答\n\n（Mock）关于「${question}」的回复：${context.slice(0, 40)}…`;
    for (const char of mock) {
      if (signal?.aborted) return;
      await new Promise((r) => { setTimeout(r, 12); });
      onChunk(char);
    }
    return;
  }

  const response = await fetch(`${TINGWU_API_BASE}/api/chat/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, context }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`问答请求失败: ${response.status}`);
  }

  if (!response.body) {
    throw new Error('问答响应体不可读');
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
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        const event = JSON.parse(trimmed) as ChatStreamEvent;
        if (event.type === 'chunk' && event.content) {
          onChunk(event.content);
        }
        if (event.type === 'error') {
          throw new Error(event.message || '问答失败');
        }
      } catch (err) {
        if (err instanceof Error && err.message !== '问答失败') {
          // JSON 解析失败忽略
        } else {
          throw err;
        }
      }
    }
  }
}
