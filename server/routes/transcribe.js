import { Router } from 'express';
import fs from 'fs/promises';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  generateOverviewMarkdown,
  transcribeLocalFile,
} from '../services/dashscopeClient.js';
import { appendSegment, getJob, upsertJob } from '../services/jobStore.js';
import { writeNdjson } from '../utils/stream.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, '../tmp/uploads');

await fs.mkdir(uploadDir, { recursive: true });

const upload = multer({ dest: uploadDir });

const router = Router();

/**
 * POST /api/transcribe/stream
 * 上传音频 → DashScope Paraformer 转写 → NDJSON 流式返回片段（供前端 Fetch ReadableStream 消费）。
 */
router.post('/stream', upload.single('file'), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ message: '缺少 file 字段' });
    return;
  }

  const recordId = req.body.recordId || `rec-${Date.now()}`;
  const filePath = req.file.path;
  const fileName = req.file.originalname || path.basename(filePath);

  res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('X-Record-Id', recordId);

  upsertJob(recordId, { status: 'processing', segments: [], error: null });

  try {
    writeNdjson(res, { type: 'meta', recordId });

    const { taskId, segments } = await transcribeLocalFile(
      filePath,
      fileName,
      (status) => {
        writeNdjson(res, { type: 'status', status });
      },
    );

    upsertJob(recordId, { taskId, status: 'processing' });

    for (let i = 0; i < segments.length; i += 1) {
      const segment = segments[i];
      appendSegment(recordId, segment);
      writeNdjson(res, { type: 'segment', segment });
      await new Promise((resolve) => {
        setTimeout(resolve, 80);
      });
    }

    let overview = '';
    try {
      overview = await generateOverviewMarkdown(fileName, segments);
    } catch {
      overview = `## 导读\n\n共识别 ${segments.length} 句。`;
    }

    upsertJob(recordId, { status: 'completed', error: null });
    writeNdjson(res, { type: 'overview', overview });
    writeNdjson(res, { type: 'done' });
    res.end();
  } catch (error) {
    const message = error instanceof Error ? error.message : '转写失败';
    upsertJob(recordId, { status: 'failed', error: message });
    writeNdjson(res, { type: 'error', message });
    res.end();
  } finally {
    await fs.unlink(filePath).catch(() => {});
  }
});

export default router;
