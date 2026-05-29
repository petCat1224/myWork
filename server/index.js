import cors from 'cors';
import express from 'express';

import config, { assertConfig } from './config.js';
import chatRouter from './routes/chat.js';
import recordsRouter from './routes/records.js';
import transcribeRouter from './routes/transcribe.js';

assertConfig();

const app = express();

app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  }),
);

app.use(express.json({ limit: '2mb' }));

/** 健康检查 */
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'tingwu-bff', time: new Date().toISOString() });
});

app.use('/api/transcribe', transcribeRouter);
app.use('/api/records', recordsRouter);
app.use('/api/chat', chatRouter);

app.use((err, _req, res, _next) => {
  const message = err instanceof Error ? err.message : '服务器错误';
  res.status(500).json({ message });
});

const server = app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`[tingwu-bff] http://localhost:${config.port} (CORS: ${config.corsOrigin})`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    // eslint-disable-next-line no-console
    console.error(
      `[tingwu-bff] 端口 ${config.port} 已被占用。请先结束旧进程：\n` +
        `  Windows: netstat -ano | findstr :${config.port}  然后 taskkill /PID <pid> /F\n` +
        `  或修改 server/.env 中的 PORT`,
    );
    process.exit(1);
  }
  throw err;
});
