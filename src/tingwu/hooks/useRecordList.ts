import { useCallback, useEffect, useState } from 'react';

import { MOCK_RECORD_SUMMARIES } from '../mock/records';
import type { TingwuListQuery, TingwuRecordSummary } from '../types';

interface UseRecordListResult {
  /** 记录列表 */
  records: TingwuRecordSummary[];
  /** 是否加载中 */
  loading: boolean;
  /** 错误信息 */
  error: string | null;
  /** 查询参数 */
  query: TingwuListQuery;
  /** 更新查询并重新拉取 */
  setQuery: (next: TingwuListQuery) => void;
  /** 手动刷新 */
  refresh: () => void;
}

/**
 * 获取听悟记录列表（模拟异步请求，支持关键词与状态筛选）。
 * @param initialQuery - 初始查询参数
 * @returns 列表数据与操作函数
 */
export function useRecordList(
  initialQuery: TingwuListQuery = {},
): UseRecordListResult {
  const [records, setRecords] = useState<TingwuRecordSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQueryState] = useState<TingwuListQuery>(initialQuery);

  const fetchRecords = useCallback(async (params: TingwuListQuery) => {
    setLoading(true);
    setError(null);

    try {
      await new Promise((resolve) => {
        setTimeout(resolve, 600);
      });

      let result = [...MOCK_RECORD_SUMMARIES];

      if (params.keyword?.trim()) {
        const kw = params.keyword.trim().toLowerCase();
        result = result.filter(
          (item) =>
            item.title.toLowerCase().includes(kw) ||
            item.tags.some((tag) => tag.toLowerCase().includes(kw)),
        );
      }

      if (params.status && params.status !== 'all') {
        result = result.filter((item) => item.status === params.status);
      }

      setRecords(result);
    } catch {
      setError('加载记录失败，请稍后重试');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const setQuery = useCallback(
    (next: TingwuListQuery) => {
      setQueryState(next);
      fetchRecords(next);
    },
    [fetchRecords],
  );

  const refresh = useCallback(() => {
    fetchRecords(query);
  }, [fetchRecords, query]);

  useEffect(() => {
    fetchRecords(query);
  }, [fetchRecords, query]);

  return { records, loading, error, query, setQuery, refresh };
}
