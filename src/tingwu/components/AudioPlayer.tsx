import {
  BackwardOutlined,
  ForwardOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import { Select, Slider } from 'antd';

import { formatDuration } from '../utils/format';

interface AudioPlayerProps {
  /** 当前时间（秒） */
  currentTime: number;
  /** 总时长（秒） */
  duration: number;
  /** 是否播放中 */
  isPlaying: boolean;
  /** 播放倍速 */
  playbackRate: number;
  /** 播放/暂停 */
  onTogglePlay: () => void;
  /** 跳转 */
  onSeek: (time: number) => void;
  /** 设置倍速 */
  onPlaybackRateChange: (rate: number) => void;
}

const RATE_OPTIONS = [
  { value: 0.75, label: '0.75x' },
  { value: 1, label: '1.0x' },
  { value: 1.25, label: '1.25x' },
  { value: 1.5, label: '1.5x' },
  { value: 2, label: '2.0x' },
];

/**
 * 听悟风格音频播放器（进度条 + 倍速 + 快进/快退）。
 * @param props - 播放器属性
 * @returns 播放器节点
 */
function AudioPlayer({
  currentTime,
  duration,
  isPlaying,
  playbackRate,
  onTogglePlay,
  onSeek,
  onPlaybackRateChange,
}: AudioPlayerProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
        <span>{formatDuration(currentTime)}</span>
        <span>{formatDuration(duration)}</span>
      </div>

      <Slider
        min={0}
        max={duration || 1}
        step={0.1}
        value={currentTime}
        onChange={onSeek}
        tooltip={{ formatter: (v) => formatDuration(v ?? 0) }}
      />

      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="text-xl text-gray-600 hover:text-[#6155f5]"
            aria-label="快退 10 秒"
            onClick={() => onSeek(Math.max(0, currentTime - 10))}
          >
            <BackwardOutlined />
          </button>

          <button
            type="button"
            className="text-3xl text-[#6155f5]"
            aria-label={isPlaying ? '暂停' : '播放'}
            onClick={onTogglePlay}
          >
            {isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
          </button>

          <button
            type="button"
            className="text-xl text-gray-600 hover:text-[#6155f5]"
            aria-label="快进 10 秒"
            onClick={() => onSeek(Math.min(duration, currentTime + 10))}
          >
            <ForwardOutlined />
          </button>
        </div>

        <Select
          size="small"
          value={playbackRate}
          options={RATE_OPTIONS}
          onChange={onPlaybackRateChange}
          className="w-24"
        />
      </div>
    </div>
  );
}

export default AudioPlayer;
