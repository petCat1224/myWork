/**
 * 向 HTTP 响应写入一行 NDJSON。
 * @param {import('express').Response} res - Express 响应
 * @param {object} payload - 事件对象
 */
export function writeNdjson(res, payload) {
  res.write(`${JSON.stringify(payload)}\n`);
}

/**
 * 配置 SSE 响应头。
 * @param {import('express').Response} res - Express 响应
 */
export function setupSse(res) {
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();
}

/**
 * 发送 SSE 事件。
 * @param {import('express').Response} res - Express 响应
 * @param {string} event - 事件名
 * @param {object} data - 数据
 */
export function writeSse(res, event, data) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}
