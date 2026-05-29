import { useMemo, useState } from 'react';
import { Empty, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

import type { TingwuTranscriptSegment } from '../types';
import { formatDuration } from '../utils/format';

interface TranscriptPanelProps {
  /** 转写片段 */
  segments: TingwuTranscriptSegment[];
  /** 当前播放时间（秒） */
  currentTime: number;
  /** 点击片段跳转 */
  onSeek: (time: number) => void;
}

const SPEAKER_COLORS = ['#6155f5', '#00b578', '#ff8f1f', '#ff3141', '#1677ff'];

/**
 * 转写文本面板：搜索、高亮当前播放片段、点击跳转。
 * @param props - 面板属性
 * @returns 转写面板节点
 */
function TranscriptPanel({ segments, currentTime, onSeek }: TranscriptPanelProps) {
  const [keyword, setKeyword] = useState('');

  const filteredSegments = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    if (!kw) {
      return segments;
    }
    return segments.filter(
      (seg) =>
        seg.text.toLowerCase().includes(kw) ||
        seg.speakerName.toLowerCase().includes(kw),
    );
  }, [keyword, segments]);

  const activeSegmentId = useMemo(() => {
    const active = segments.find(
      (seg) => currentTime >= seg.startTime && currentTime < seg.endTime,
    );
    return active?.id;
  }, [currentTime, segments]);

  if (segments.length === 0) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-xl bg-white">
        <Empty description="暂无转写内容" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-xl border border-gray-200 bg-white">
      <div className="border-b border-gray-100 p-4">
        <Input
          allowClear
          prefix={<SearchOutlined className="text-gray-400" />}
          placeholder="搜索转写内容或说话人"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {filteredSegments.length === 0 ? (
          <Empty description="未找到匹配的转写内容" className="py-12" />
        ) : (
          <ul className="space-y-4">
            {filteredSegments.map((seg, index) => {
              const color = SPEAKER_COLORS[index % SPEAKER_COLORS.length];
              const isActive = seg.id === activeSegmentId;

              return (
                <li key={seg.id}>
                  <button
                    type="button"
                    onClick={() => onSeek(seg.startTime)}
                    className={[
                      'w-full rounded-lg border px-4 py-3 text-left transition-colors',
                      isActive
                        ? 'border-[#6155f5]/40 bg-[#6155f5]/5'
                        : 'border-transparent hover:bg-gray-50',
                    ].join(' ')}
                  >
                    <div className="mb-1 flex items-center gap-2 text-xs">
                      <span
                        className="font-medium"
                        style={{ color }}
                      >
                        {seg.speakerName}
                      </span>
                      <span className="text-gray-400">
                        {formatDuration(seg.startTime)}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-gray-800">{seg.text}</p>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

export default TranscriptPanel;
