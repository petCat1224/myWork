import dotenv from 'dotenv';

dotenv.config();

/**
 * 读取必填环境变量，缺失时抛错（启动阶段 fail-fast）。
 * @param {string} key - 环境变量名
 * @returns {string} 变量值
 */
function required(key) {
  const value = process.env[key]?.trim();
  if (!value) {
    throw new Error(`缺少环境变量: ${key}，请复制 server/.env.example 为 server/.env 并填写`);
  }
  return value;
}

/** @type {import('./config.js').ServerConfig} */
const config = {
  port: Number(process.env.PORT) || 3001,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  dashscopeApiKey: process.env.DASHSCOPE_API_KEY?.trim() || '',
  asrModel: process.env.DASHSCOPE_ASR_MODEL || 'paraformer-v2',
  chatModel: process.env.DASHSCOPE_CHAT_MODEL || 'qwen-plus',
  dashscopeBase: 'https://dashscope.aliyuncs.com/api/v1',
  pollIntervalMs: Number(process.env.POLL_INTERVAL_MS) || 2000,
  pollMaxAttempts: Number(process.env.POLL_MAX_ATTEMPTS) || 90,
};

/**
 * 启动前校验 API Key。
 */
export function assertConfig() {
  required('DASHSCOPE_API_KEY');
  config.dashscopeApiKey = required('DASHSCOPE_API_KEY');
}

export default config;
