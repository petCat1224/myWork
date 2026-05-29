/**
 * 将秒数格式化为 mm:ss 或 hh:mm:ss。
 * @param seconds - 总秒数
 * @returns 格式化后的时间字符串
 */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const pad = (n: number) => String(n).padStart(2, '0');
  if (h > 0) {
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  }
  return `${pad(m)}:${pad(s)}`;
}

/**
 * 格式化 ISO 日期为本地化展示。
 * @param iso - ISO 日期字符串
 * @returns 本地化日期时间
 */
export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * 根据来源类型返回中文标签。
 * @param source - 来源类型
 * @returns 中文标签
 */
export function formatSourceLabel(source: string): string {
  const map: Record<string, string> = {
    upload: '本地上传',
    meeting: '在线会议',
    live: '实时录音',
  };
  return map[source] ?? source;
}

/**
 * 根据状态返回中文标签。
 * @param status - 处理状态
 * @returns 中文标签
 */
export function formatStatusLabel(status: string): string {
  const map: Record<string, string> = {
    processing: '处理中',
    completed: '已完成',
    failed: '处理失败',
  };
  return map[status] ?? status;
}
