import { useCallback, useEffect, useState } from 'react';

import { MOCK_RECORD_DETAILS, MOCK_RECORD_SUMMARIES } from '../mock/records';
import type { TingwuRecordDetail } from '../types';

interface UseRecordDetailResult {
  /** 记录详情 */
  record: TingwuRecordDetail | null;
  /** 是否加载中 */
  loading: boolean;
  /** 错误信息 */
  error: string | null;
  /** 重新加载 */
  refresh: () => void;
}

/**
 * 根据 ID 获取听悟记录详情（模拟异步请求）。
 * @param recordId - 记录 ID
 * @returns 详情数据与状态
 */
export function useRecordDetail(recordId: string | undefined): UseRecordDetailResult {
  const [record, setRecord] = useState<TingwuRecordDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      await new Promise((resolve) => {
        setTimeout(resolve, 500);
      });

      const summary = MOCK_RECORD_SUMMARIES.find((item) => item.id === id);

      if (!summary) {
        setRecord(null);
        setError('记录不存在');
        return;
      }

      if (summary.status === 'processing') {
        setRecord(null);
        setError('记录正在处理中，请稍后查看');
        return;
      }

      if (summary.status === 'failed') {
        setRecord(null);
        setError('记录处理失败，请重新上传');
        return;
      }

      const detail = MOCK_RECORD_DETAILS[id];
      if (!detail) {
        setRecord({
          ...summary,
          overview: '暂无导读内容',
          transcript: [],
          chapters: [],
          speakers: [],
          keyPoints: [],
          chatHistory: [],
        });
        return;
      }

      setRecord(detail);
    } catch {
      setError('加载详情失败，请稍后重试');
      setRecord(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(() => {
    if (recordId) {
      fetchDetail(recordId);
    }
  }, [fetchDetail, recordId]);

  useEffect(() => {
    if (!recordId) {
      setRecord(null);
      setLoading(false);
      return;
    }
    fetchDetail(recordId);
  }, [fetchDetail, recordId]);

  return { record, loading, error, refresh };
}
