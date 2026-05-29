import { useCallback, useEffect, useRef } from 'react';

import {
  clearRecordingError,
  pauseRecording,
  resumeRecording,
  setRecordingError,
  startRecording,
  stopRecording,
  tickRecordingDuration,
} from '../store/recordingSlice';
import { useTingwuDispatch, useTingwuSelector } from '../store/hooks';
import { parseGetUserMediaError } from '../utils/microphonePermission';

interface UseMediaRecorderResult {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  blobUrl: string | null;
  error: string | null;
  errorType: 'permission' | 'device' | 'recording' | 'unknown' | null;
  start: () => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => Promise<Blob | null>;
  clearError: () => void;
}

/**
 * MediaStream Recording API 封装。
 *
 * 权限与录音分两阶段：
 * 1. getUserMedia → 浏览器弹出「是否允许麦克风」（仅首次/未禁止时）
 * 2. MediaRecorder → 在已有麦克风流上编码录音；onerror 与权限无关
 */
export function useMediaRecorder(): UseMediaRecorderResult {
  const dispatch = useTingwuDispatch();
  const { isRecording, isPaused, duration, blobUrl, error, errorType } = useTingwuSelector(
    (state) => state.recording,
  );

  // MediaRecorder / MediaStream 不能放 Redux（不可序列化），用 ref 保存在组件外层的 Hook 里
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedDurationRef = useRef<number>(0);

  const clearTimer = useCallback(() => {
    if (timerRef.current != null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  /** 停止麦克风流，释放硬件（否则浏览器地址栏会一直显示「正在使用麦克风」） */
  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  useEffect(
    () => () => {
      clearTimer();
      stopStream();
      mediaRecorderRef.current?.stop();
    },
    [clearTimer, stopStream],
  );

  /**
   * 开始录音：先申请麦克风，再创建 MediaRecorder。
   */
  const start = useCallback(async () => {
    dispatch(clearRecordingError());

    try {
      /**
       * 【权限弹窗在这里触发】
       * 只有这一行会请求浏览器原生「允许使用麦克风」对话框。
       * - 用户点「允许」→ 返回 MediaStream，继续往下执行
       * - 用户点「禁止」或之前已禁止 → 抛 NotAllowedError，进入 catch
       * 注意：recorder.onerror 不会、也不能再次弹出权限框。
       */
    
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
    

      // 选择浏览器支持的音频编码格式（优先 opus，体积小音质好）
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      console.log('recorder2222', recorder);

      /**
       * 每当产生一段音频数据时触发（由 start 的时间片参数决定频率）。
       * 把每段 Blob 推进数组，stop 时再合并成完整录音文件。
       */
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      /**
       * 【这不是权限错误回调】
       * 触发时机：编码器异常、轨道异常等，此时 getUserMedia 已经成功。
       * 权限问题应在上面 getUserMedia 的 catch 里处理。
       */
      recorder.onerror = () => {
        dispatch(
          setRecordingError({
            type: 'recording',
            message: '录音过程中发生错误（编码或设备异常），请重试。',
          }),
        );
        clearTimer();
        stopStream();
      };

      /**
       * start(250) 的含义：
       * 每 250 毫秒触发一次 ondataavailable，并写入一块音频数据。
       * - 数字单位是毫秒（timeslice）
       * - 不传参数则只在 stop() 时一次性输出全部数据
       * 使用小时间片可以在长录音时降低内存峰值，并便于以后做「边录边传」。
       */
      recorder.start(250);

      dispatch(startRecording({ mimeType }));
      startTimeRef.current = Date.now();
      pausedDurationRef.current = 0;

      // 每 500ms 更新 Redux 里的录音时长，驱动 UI 计时显示
      clearTimer();
      timerRef.current = window.setInterval(() => {
        if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
          return;
        }
        if (mediaRecorderRef.current.state === 'recording') {
          const elapsed = (Date.now() - startTimeRef.current) / 1000 + pausedDurationRef.current;
          dispatch(tickRecordingDuration(Math.floor(elapsed)));
        }
      }, 500);
    } catch (err) {
      console.log('err3333', err);
      
      // getUserMedia 失败：权限拒绝、无设备、非 HTTPS 等
      const parsed = parseGetUserMediaError(err);
      dispatch(
        setRecordingError({
          type: parsed.type,
          message: parsed.message,
        }),
      );
    }
  }, [clearTimer, dispatch, stopStream]);

  const pause = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.pause();
      pausedDurationRef.current += (Date.now() - startTimeRef.current) / 1000;
      dispatch(pauseRecording());
    }
  }, [dispatch]);

  const resume = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'paused') {
      mediaRecorderRef.current.resume();
      startTimeRef.current = Date.now();
      dispatch(resumeRecording());
    }
  }, [dispatch]);

  /**
   * 停止录音：触发最后一次 ondataavailable，在 onstop 里合并 Blob。
   */
  const stop = useCallback(
    () =>
      new Promise<Blob | null>((resolve) => {
        const recorder = mediaRecorderRef.current;
        if (!recorder || recorder.state === 'inactive') {
          resolve(null);
          return;
        }

        recorder.onstop = () => {
          clearTimer();
          stopStream();
          const mimeType = recorder.mimeType || 'audio/webm';
          const blob = new Blob(chunksRef.current, { type: mimeType });
          const url = URL.createObjectURL(blob);
          dispatch(stopRecording(url));
          resolve(blob);
        };

        recorder.stop();
      }),
    [clearTimer, dispatch, stopStream],
  );

  const clearError = useCallback(() => {
    dispatch(clearRecordingError());
  }, [dispatch]);

  return {
    isRecording,
    isPaused,
    duration,
    blobUrl,
    error,
    errorType,
    start,
    pause,
    resume,
    stop,
    clearError,
  };
}
