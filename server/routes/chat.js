import { Router } from 'express';

import { streamQwenChat } from '../services/dashscopeClient.js';
import { writeNdjson } from '../utils/stream.js';

const router = Router();

/**
 * POST /api/chat/stream
 * Qwen 流式问答（NDJSON），供前端 Redux Thunk 消费。
 *
 * Body: { question: string, context?: string }
 */
router.post('/stream', async (req, res) => {
  const { question, context = '' } = req.body ?? {};

  if (!question?.trim()) {
    res.status(400).json({ message: 'question 不能为空' });
    return;
  }

  res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');

  const messages = [
    {
      role: 'system',
      content: '你是通义听悟 AI 助手，基于用户提供的听记内容回答问题，使用 Markdown 格式。',
    },
    {
      role: 'user',
      content: `听记上下文：\n${context}\n\n用户问题：${question}`,
    },
  ];

  try {
    await streamQwenChat(messages, (chunk) => {
      writeNdjson(res, { type: 'chunk', content: chunk });
    });
    writeNdjson(res, { type: 'done' });
    res.end();
  } catch (error) {
    const message = error instanceof Error ? error.message : '问答失败';
    writeNdjson(res, { type: 'error', message });
    res.end();
  }
});

export default router;
