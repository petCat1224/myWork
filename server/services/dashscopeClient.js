import fs from 'fs/promises';
import path from 'path';

import config from '../config.js';
import { mapParaformerResultToSegments } from './transcriptMapper.js';

/**
 * 构造 DashScope 鉴权请求头。
 * @param {Record<string, string>} [extra] - 额外 Header
 * @returns {Record<string, string>} 请求头
 */
function authHeaders(extra = {}) {
  return {
    Authorization: `Bearer ${config.dashscopeApiKey}`,
    ...extra,
  };
}

/**
 * 向 DashScope 申请 OSS 上传凭证。
 * @param {string} modelName - 模型名（与后续 ASR 模型一致）
 * @returns {Promise<object>} policy data
 */
async function getUploadPolicy(modelName) {
  const url = `${config.dashscopeBase}/uploads?action=getPolicy&model=${encodeURIComponent(modelName)}`;
  const response = await fetch(url, {
    headers: authHeaders({ 'Content-Type': 'application/json' }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`获取上传凭证失败: ${response.status} ${text}`);
  }

  const json = await response.json();
  return json.data;
}

/**
 * 将本地文件上传到 DashScope 临时 OSS，返回 oss:// URL。
 * @param {string} filePath - 本地绝对路径
 * @param {string} fileName - 文件名
 * @returns {Promise<string>} oss:// 形式 URL
 */
export async function uploadLocalFileToDashScopeOss(filePath, fileName) {
  const policy = await getUploadPolicy(config.asrModel);
  const key = `${policy.upload_dir}/${fileName}`;
  const fileBuffer = await fs.readFile(filePath);

  const form = new FormData();
  form.append('OSSAccessKeyId', policy.oss_access_key_id);
  form.append('Signature', policy.signature);
  form.append('policy', policy.policy);
  form.append('x-oss-object-acl', policy.x_oss_object_acl);
  form.append('x-oss-forbid-overwrite', policy.x_oss_forbid_overwrite);
  form.append('key', key);
  form.append('success_action_status', '200');
  form.append('file', new Blob([fileBuffer]), fileName);

  const uploadRes = await fetch(policy.upload_host, {
    method: 'POST',
    body: form,
  });

  if (!uploadRes.ok) {
    const text = await uploadRes.text();
    throw new Error(`上传 OSS 失败: ${uploadRes.status} ${text}`);
  }

  return `oss://${key}`;
}

/**
 * 提交 Paraformer 异步转写任务。
 * @param {string} fileUrl - oss:// 或 https:// 文件地址
 * @returns {Promise<string>} task_id
 */
export async function submitTranscriptionTask(fileUrl) {
  const response = await fetch(`${config.dashscopeBase}/services/audio/asr/transcription`, {
    method: 'POST',
    headers: authHeaders({
      'Content-Type': 'application/json',
      'X-DashScope-Async': 'enable',
      'X-DashScope-OssResourceResolve': 'enable',
    }),
    body: JSON.stringify({
      model: config.asrModel,
      input: { file_urls: [fileUrl] },
      parameters: {
        diarization_enabled: true,
        language_hints: ['zh', 'en'],
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`提交转写任务失败: ${response.status} ${text}`);
  }

  const json = await response.json();
  const taskId = json?.output?.task_id;
  if (!taskId) {
    throw new Error('DashScope 未返回 task_id');
  }
  return taskId;
}

/**
 * 查询异步任务状态。
 * @param {string} taskId - 任务 ID
 * @returns {Promise<object>} 任务 output
 */
async function fetchTaskOutput(taskId) {
  const response = await fetch(`${config.dashscopeBase}/tasks/${taskId}`, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`查询任务失败: ${response.status} ${text}`);
  }

  const json = await response.json();
  return json.output;
}

/**
 * 轮询转写任务直至完成。
 * @param {string} taskId - 任务 ID
 * @param {(status: string) => void} [onStatus] - 状态回调
 * @returns {Promise<object>} 完成的 output
 */
export async function waitForTranscriptionTask(taskId, onStatus) {
  for (let attempt = 0; attempt < config.pollMaxAttempts; attempt += 1) {
    const output = await fetchTaskOutput(taskId);
    const status = output?.task_status;
    onStatus?.(status);

    if (status === 'SUCCEEDED') {
      return output;
    }
    if (status === 'FAILED') {
      throw new Error(output?.message || 'DashScope 转写任务失败');
    }

    await new Promise((resolve) => {
      setTimeout(resolve, config.pollIntervalMs);
    });
  }

  throw new Error('转写任务超时，请稍后重试');
}

/**
 * 下载 transcription_url 并解析为片段。
 * @param {object} taskOutput - 任务 output
 * @returns {Promise<Array<object>>} 转写片段
 */
export async function fetchSegmentsFromTaskOutput(taskOutput) {
  const resultItem = taskOutput?.results?.[0];
  if (!resultItem) {
    throw new Error('转写结果为空');
  }

  if (resultItem.subtask_status === 'FAILED') {
    throw new Error(resultItem.message || '子任务转写失败');
  }

  const transcriptionUrl = resultItem.transcription_url;
  if (!transcriptionUrl) {
    throw new Error('未返回 transcription_url');
  }

  const response = await fetch(transcriptionUrl);
  if (!response.ok) {
    throw new Error(`下载转写结果失败: ${response.status}`);
  }

  const json = await response.json();
  return mapParaformerResultToSegments(json);
}

/**
 * 完整流程：本地文件 → OSS → 提交任务 → 轮询 → 返回片段。
 * @param {string} filePath - 本地路径
 * @param {string} fileName - 文件名
 * @param {(status: string) => void} [onStatus] - 状态回调
 * @returns {Promise<{ taskId: string, segments: Array<object> }>} 结果
 */
export async function transcribeLocalFile(filePath, fileName, onStatus) {
  const ossUrl = await uploadLocalFileToDashScopeOss(filePath, fileName);
  onStatus?.('UPLOADED');

  const taskId = await submitTranscriptionTask(ossUrl);
  onStatus?.('SUBMITTED');

  const output = await waitForTranscriptionTask(taskId, onStatus);
  const segments = await fetchSegmentsFromTaskOutput(output);

  return { taskId, segments };
}

/**
 * 调用 Qwen 流式生成（SSE），逐块回调文本。
 * @param {Array<{ role: string, content: string }>} messages - 对话消息
 * @param {(chunk: string) => void} onChunk - 文本块回调
 * @returns {Promise<string>} 完整回复
 */
export async function streamQwenChat(messages, onChunk) {
  const response = await fetch(`${config.dashscopeBase}/services/aigc/text-generation/generation`, {
    method: 'POST',
    headers: authHeaders({
      'Content-Type': 'application/json',
      'X-DashScope-SSE': 'enable',
    }),
    body: JSON.stringify({
      model: config.chatModel,
      input: { messages },
      parameters: {
        incremental_output: true,
        result_format: 'message',
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Qwen 请求失败: ${response.status} ${text}`);
  }

  if (!response.body) {
    throw new Error('Qwen 响应体不可读');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split('\n');
    buffer = parts.pop() ?? '';

    parts.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) {
        return;
      }
      const payload = trimmed.slice(5).trim();
      if (!payload || payload === '[DONE]') {
        return;
      }
      try {
        const json = JSON.parse(payload);
        const chunk =
          json?.output?.choices?.[0]?.message?.content ??
          json?.output?.text ??
          '';
        if (chunk) {
          fullText += chunk;
          onChunk(chunk);
        }
      } catch {
        // 忽略非 JSON 行
      }
    });
  }

  return fullText;
}

/**
 * 基于转写内容生成 Markdown 导读。
 * @param {string} title - 标题
 * @param {Array<object>} segments - 转写片段
 * @returns {Promise<string>} Markdown 导读
 */
export async function generateOverviewMarkdown(title, segments) {
  const transcriptText = segments.map((s) => s.text).join('\n').slice(0, 6000);
  const messages = [
    {
      role: 'system',
      content:
        '你是通义听悟风格的会议助手。请用 Markdown 输出导读，包含：核心摘要、关键议题（列表）、待办事项（如有）。简洁专业。',
    },
    {
      role: 'user',
      content: `标题：${title}\n\n转写内容：\n${transcriptText}`,
    },
  ];

  let result = '';
  await streamQwenChat(messages, (chunk) => {
    result += chunk;
  });
  return result;
}
