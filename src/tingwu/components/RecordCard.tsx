import { ClockCircleOutlined, TagOutlined } from '@ant-design/icons';
import { Tag } from 'antd';
import { Link } from 'react-router-dom';

import type { TingwuRecordSummary } from '../types';
import { formatDateTime, formatDuration, formatSourceLabel, formatStatusLabel } from '../utils/format';

interface RecordCardProps {
  /** 记录摘要 */
  record: TingwuRecordSummary;
}

const STATUS_COLOR: Record<string, string> = {
  completed: 'success',
  processing: 'processing',
  failed: 'error',
};

/**
 * 听悟记录卡片（列表项）。
 * @param props - 卡片属性
 * @returns 卡片节点
 */
function RecordCard({ record }: RecordCardProps) {
  const clickable = record.status === 'completed';

  const content = (
    <article
      className={[
        'rounded-xl border border-gray-200 bg-white p-4 transition-shadow',
        clickable ? 'cursor-pointer hover:border-[#6155f5]/30 hover:shadow-md' : 'opacity-80',
      ].join(' ')}
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <h3 className="line-clamp-2 text-base font-medium text-gray-900">{record.title}</h3>
        <Tag color={STATUS_COLOR[record.status]}>{formatStatusLabel(record.status)}</Tag>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-gray-500">
        <span className="inline-flex items-center gap-1">
          <ClockCircleOutlined />
          {formatDuration(record.duration)}
        </span>
        <span>{formatSourceLabel(record.source)}</span>
        <span>{formatDateTime(record.createdAt)}</span>
      </div>

      {record.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <TagOutlined className="text-gray-400" />
          {record.tags.map((tag) => (
            <Tag key={tag} className="!m-0">
              {tag}
            </Tag>
          ))}
        </div>
      )}
    </article>
  );

  if (clickable) {
    return <Link to={`/tingwu/record/${record.id}`}>{content}</Link>;
  }

  return content;
}

export default RecordCard;
