import { useCallback, useEffect, useRef, useState } from 'react';

interface UseAudioPlaybackOptions {
  /** 总时长（秒），无真实音频时使用模拟进度 */
  duration: number;
}

interface UseAudioPlaybackResult {
  /** 当前播放时间（秒） */
  currentTime: number;
  /** 是否正在播放 */
  isPlaying: boolean;
  /** 播放倍速 */
  playbackRate: number;
  /** 播放 / 暂停切换 */
  togglePlay: () => void;
  /** 跳转到指定时间 */
  seek: (time: number) => void;
  /** 设置倍速 */
  setPlaybackRate: (rate: number) => void;
}

/**
 * 音频播放 Hook（演示环境使用模拟计时器，真实项目可替换为 HTMLAudioElement）。
 * @param options - 配置项
 * @returns 播放状态与控制函数
 */
export function useAudioPlayback({
  duration,
}: UseAudioPlaybackOptions): UseAudioPlaybackResult {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRateState] = useState(1);
  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(0);

  const cancelTick = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const tick = useCallback(
    (timestamp: number) => {
      if (!lastTickRef.current) {
        lastTickRef.current = timestamp;
      }

      const delta = (timestamp - lastTickRef.current) / 1000;
      lastTickRef.current = timestamp;

      setCurrentTime((prev) => {
        const next = prev + delta * playbackRate;
        if (next >= duration) {
          setIsPlaying(false);
          cancelTick();
          return duration;
        }
        return next;
      });

      rafRef.current = requestAnimationFrame(tick);
    },
    [cancelTick, duration, playbackRate],
  );

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => {
      const next = !prev;
      if (next) {
        lastTickRef.current = 0;
        rafRef.current = requestAnimationFrame(tick);
      } else {
        cancelTick();
      }
      return next;
    });
  }, [cancelTick, tick]);

  const seek = useCallback(
    (time: number) => {
      const clamped = Math.max(0, Math.min(time, duration));
      setCurrentTime(clamped);
    },
    [duration],
  );

  const setPlaybackRate = useCallback((rate: number) => {
    setPlaybackRateState(rate);
  }, []);

  useEffect(() => () => cancelTick(), [cancelTick]);

  useEffect(() => {
    setCurrentTime(0);
    setIsPlaying(false);
    cancelTick();
  }, [cancelTick, duration]);

  return {
    currentTime,
    isPlaying,
    playbackRate,
    togglePlay,
    seek,
    setPlaybackRate,
  };
}
