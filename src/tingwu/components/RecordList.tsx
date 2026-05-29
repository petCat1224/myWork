import { Empty, Spin } from 'antd';

import type { TingwuRecordSummary } from '../types';
import RecordCard from './RecordCard';

interface RecordListProps {
  /** 记录列表 */
  records: TingwuRecordSummary[];
  /** 是否加载中 */
  loading: boolean;
}

/**
 * 听悟记录列表，统一处理 Loading 与 Empty。
 * @param props - 列表属性
 * @returns 列表节点
 */
function RecordList({ records, loading }: RecordListProps) {
  if (loading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center">
        <Spin description="加载记录中…" size="large" />
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="flex min-h-[240px] items-center justify-center rounded-xl bg-white">
        <Empty description="暂无听记记录，上传音视频开始转写" />
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {records.map((record) => (
        <RecordCard key={record.id} record={record} />
      ))}
    </div>
  );
}

export default RecordList;
