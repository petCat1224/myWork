/**
 * API 根路径；开发环境留空时走 Vite 代理 /api。
 */
export const TINGWU_API_BASE = import.meta.env.VITE_TINGWU_API_BASE?.trim() ?? '';

/**
 * 是否使用真实转写 API（默认 true，仅当 VITE_USE_MOCK_TRANSCRIBE=true 时用 Mock）。
 */
export const USE_REAL_API = import.meta.env.VITE_USE_MOCK_TRANSCRIBE !== 'true';

/**
 * SSE 转写路径模板。
 */
export const TINGWU_SSE_PATH =
  import.meta.env.VITE_TINGWU_SSE_PATH ?? '/api/records/{id}/transcript/stream';

/**
 * Fetch 流式上传转写路径。
 */
export const TINGWU_UPLOAD_PATH =
  import.meta.env.VITE_TINGWU_UPLOAD_PATH ?? '/api/transcribe/stream';

/**
 * 将路径模板中的 {id} 替换为记录 ID。
 * @param template - 路径模板
 * @param id - 记录 ID
 * @returns 完整路径
 */
export function resolvePath(template: string, id: string): string {
  return template.replace('{id}', encodeURIComponent(id));
}
