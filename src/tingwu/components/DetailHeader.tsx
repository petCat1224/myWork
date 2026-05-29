import { ArrowLeftOutlined, DownloadOutlined, ShareAltOutlined } from '@ant-design/icons';
import { Button, Tag } from 'antd';
import { Link } from 'react-router-dom';

import type { TingwuRecordDetail } from '../types';
import { formatDateTime, formatDuration, formatSourceLabel } from '../utils/format';

interface DetailHeaderProps {
  /** 记录详情 */
  record: TingwuRecordDetail;
}

/**
 * 详情页顶栏：返回、标题、元信息、导出/分享。
 * @param props - 顶栏属性
 * @returns 顶栏节点
 */
function DetailHeader({ record }: DetailHeaderProps) {
  return (
    <header className="border-b border-gray-200 bg-white px-6 py-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <Link to="/tingwu">
            <Button type="text" icon={<ArrowLeftOutlined />} aria-label="返回列表" />
          </Link>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold text-gray-900">{record.title}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500">
              <span>{formatDuration(record.duration)}</span>
              <span>{formatSourceLabel(record.source)}</span>
              <span>{formatDateTime(record.createdAt)}</span>
              {record.tags.map((tag) => (
                <Tag key={tag} className="!m-0">
                  {tag}
                </Tag>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button icon={<ShareAltOutlined />}>分享</Button>
          <Button type="primary" icon={<DownloadOutlined />}>
            导出
          </Button>
        </div>
      </div>
    </header>
  );
}

export default DetailHeader;
