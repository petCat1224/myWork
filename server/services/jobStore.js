/**
 * @typedef {'pending' | 'processing' | 'completed' | 'failed'} JobStatus
 */

/**
 * @typedef {object} TranscriptJob
 * @property {string} recordId - 前端记录 ID
 * @property {JobStatus} status - 任务状态
 * @property {Array<object>} segments - 已产出的转写片段
 * @property {string | null} error - 错误信息
 * @property {string | null} taskId - DashScope 异步任务 ID
 * @property {number} updatedAt - 最后更新时间戳
 */

/** @type {Map<string, TranscriptJob>} */
const jobs = new Map();

/**
 * 创建或更新转写任务。
 * @param {string} recordId - 记录 ID
 * @param {Partial<TranscriptJob>} patch - 更新字段
 * @returns {TranscriptJob} 任务对象
 */
export function upsertJob(recordId, patch) {
  const existing = jobs.get(recordId) ?? {
    recordId,
    status: 'pending',
    segments: [],
    error: null,
    taskId: null,
    updatedAt: Date.now(),
  };

  const next = {
    ...existing,
    ...patch,
    updatedAt: Date.now(),
  };

  jobs.set(recordId, next);
  return next;
}

/**
 * 获取转写任务。
 * @param {string} recordId - 记录 ID
 * @returns {TranscriptJob | undefined} 任务或 undefined
 */
export function getJob(recordId) {
  return jobs.get(recordId);
}

/**
 * 追加转写片段（去重 by id）。
 * @param {string} recordId - 记录 ID
 * @param {object} segment - 转写片段
 */
export function appendSegment(recordId, segment) {
  const job = upsertJob(recordId, {});
  const exists = job.segments.some((item) => item.id === segment.id);
  if (!exists) {
    job.segments.push(segment);
    job.updatedAt = Date.now();
    jobs.set(recordId, job);
  }
}
