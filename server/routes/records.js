import { Router } from 'express';

import { getJob } from '../services/jobStore.js';
import { setupSse, writeSse } from '../utils/stream.js';

const router = Router();

/**
 * GET /api/records/:id/transcript/stream
 * SSE 订阅转写进度（处理中任务轮询推送，已完成任务回放片段）。
 */
router.get('/:id/transcript/stream', async (req, res) => {
  const { id } = req.params;
  setupSse(res);

  const job = getJob(id);

  if (!job) {
    writeSse(res, 'error', { message: '任务不存在，请先上传或录音转写' });
    res.end();
    return;
  }

  let lastIndex = 0;

  /**
   * 将已有片段推送给客户端。
   */
  const pushNewSegments = () => {
    const current = getJob(id);
    if (!current) {
      return;
    }

    while (lastIndex < current.segments.length) {
      writeSse(res, 'segment', current.segments[lastIndex]);
      lastIndex += 1;
    }
  };

  pushNewSegments();

  if (job.status === 'completed') {
    writeSse(res, 'done', {});
    res.end();
    return;
  }

  if (job.status === 'failed') {
    writeSse(res, 'error', { message: job.error || '转写失败' });
    res.end();
    return;
  }

  const timer = setInterval(() => {
    const current = getJob(id);
    if (!current) {
      clearInterval(timer);
      res.end();
      return;
    }

    pushNewSegments();

    if (current.status === 'completed') {
      writeSse(res, 'done', {});
      clearInterval(timer);
      res.end();
    }

    if (current.status === 'failed') {
      writeSse(res, 'error', { message: current.error || '转写失败' });
      clearInterval(timer);
      res.end();
    }
  }, 1000);

  req.on('close', () => {
    clearInterval(timer);
  });
});

export default router;
