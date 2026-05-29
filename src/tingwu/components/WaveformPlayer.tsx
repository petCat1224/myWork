import { useEffect, useRef } from 'react';
import {
  BackwardOutlined,
  ForwardOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import { Empty, Select, Spin } from 'antd';
import WaveSurfer from 'wavesurfer.js';

import {
  clearSeekRequest,
  setCurrentTime,
  setIsPlaying,
  setPlaybackRate,
  setReady,
} from '../store/playbackSlice';
import { useTingwuDispatch, useTingwuSelector } from '../store/hooks';
import { formatDuration } from '../utils/format';

interface WaveformPlayerProps {
  /** 音频 URL（Blob URL 或远程地址） */
  audioUrl?: string | null;
  /** 总时长回退值（秒） */
  fallbackDuration?: number;
  /** 跳转回调（供转写面板同步） */
  onSeek?: (time: number) => void;
}

const RATE_OPTIONS = [
  { value: 0.75, label: '0.75x' },
  { value: 1, label: '1.0x' },
  { value: 1.25, label: '1.25x' },
  { value: 1.5, label: '1.5x' },
  { value: 2, label: '2.0x' },
];

/**
 * 基于 wavesurfer.js 的波形播放器，状态同步至 Redux。
 * @param props - 播放器属性
 * @returns 波形播放器节点
 */
function WaveformPlayer({ audioUrl, fallbackDuration = 0, onSeek }: WaveformPlayerProps) {
  const dispatch = useTingwuDispatch();
  const { currentTime, isPlaying, playbackRate, ready, seekRequest } = useTingwuSelector(
    (state) => state.playback,
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const waveSurferRef = useRef<WaveSurfer | null>(null);

  useEffect(() => {
    if (!containerRef.current || !audioUrl) {
      return undefined;
    }

    dispatch(setReady(false));

    const ws = WaveSurfer.create({
      container: containerRef.current,
      height: 72,
      waveColor: '#c7c4ff',
      progressColor: '#6155f5',
      cursorColor: '#6155f5',
      barWidth: 2,
      barGap: 2,
      barRadius: 2,
      url: audioUrl,
    });

    waveSurferRef.current = ws;

    ws.on('ready', () => {
      dispatch(setReady(true));
      ws.setPlaybackRate(playbackRate);
    });

    ws.on('timeupdate', (time) => {
      dispatch(setCurrentTime(time));
    });

    ws.on('play', () => dispatch(setIsPlaying(true)));
    ws.on('pause', () => dispatch(setIsPlaying(false)));
    ws.on('finish', () => dispatch(setIsPlaying(false)));

    return () => {
      ws.destroy();
      waveSurferRef.current = null;
      dispatch(setReady(false));
    };
  }, [audioUrl, dispatch]);

  useEffect(() => {
    waveSurferRef.current?.setPlaybackRate(playbackRate);
  }, [playbackRate]);

  useEffect(() => {
    if (seekRequest != null && waveSurferRef.current) {
      waveSurferRef.current.setTime(seekRequest);
      dispatch(setCurrentTime(seekRequest));
      dispatch(clearSeekRequest());
      onSeek?.(seekRequest);
    }
  }, [dispatch, onSeek, seekRequest]);

  /** 播放 / 暂停 */
  const handleToggle = () => {
    waveSurferRef.current?.playPause();
  };

  /** 跳转 */
  const handleSeek = (time: number) => {
    waveSurferRef.current?.setTime(time);
    dispatch(setCurrentTime(time));
    onSeek?.(time);
  };

  const duration = waveSurferRef.current?.getDuration() || fallbackDuration;

  if (!audioUrl) {
    return (
      <div className="tingwu-waveform rounded-xl border border-gray-200 bg-white p-6">
        <Empty description="暂无音频，请上传文件或实时录音" />
      </div>
    );
  }

  return (
    <div className="tingwu-waveform rounded-xl border border-gray-200 bg-white p-4">
      {!ready && (
        <div className="mb-2 flex items-center gap-2 text-xs text-[#6155f5]">
          <Spin size="small" />
          波形加载中…
        </div>
      )}

      <div ref={containerRef} className="mb-3 min-h-[72px] w-full" />

      <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
        <span>{formatDuration(currentTime)}</span>
        <span>{formatDuration(duration)}</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="text-lg text-gray-600 hover:text-[#6155f5]"
            aria-label="快退 10 秒"
            onClick={() => handleSeek(Math.max(0, currentTime - 10))}
          >
            <BackwardOutlined />
          </button>

          <button
            type="button"
            className="text-3xl text-[#6155f5]"
            aria-label={isPlaying ? '暂停' : '播放'}
            onClick={handleToggle}
            disabled={!ready}
          >
            {isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
          </button>

          <button
            type="button"
            className="text-lg text-gray-600 hover:text-[#6155f5]"
            aria-label="快进 10 秒"
            onClick={() => handleSeek(Math.min(duration, currentTime + 10))}
          >
            <ForwardOutlined />
          </button>
        </div>

        <Select
          size="small"
          value={playbackRate}
          options={RATE_OPTIONS}
          className="w-24"
          onChange={(rate) => dispatch(setPlaybackRate(rate))}
        />
      </div>
    </div>
  );
}

export default WaveformPlayer;
