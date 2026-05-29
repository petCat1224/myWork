import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface RecordingState {
  /** 是否正在录音 */
  isRecording: boolean;
  /** 是否暂停录音 */
  isPaused: boolean;
  /** 已录制时长（秒） */
  duration: number;
  /** 录音 Blob URL */
  blobUrl: string | null;
  /** 错误文案 */
  error: string | null;
  /** 错误类型（用于 UI 决定是否弹出权限引导） */
  errorType: 'permission' | 'device' | 'recording' | 'unknown' | null;
  /** MediaRecorder 使用的音频 MIME */
  mimeType: string | null;
}

const initialState: RecordingState = {
  isRecording: false,
  isPaused: false,
  duration: 0,
  blobUrl: null,
  error: null,
  errorType: null,
  mimeType: null,
};

const recordingSlice = createSlice({
  name: 'recording',
  initialState,
  reducers: {
    /** 开始录音 */
    startRecording(state, action: PayloadAction<{ mimeType: string }>) {
      state.isRecording = true;
      state.isPaused = false;
      state.duration = 0;
      state.error = null;
      state.mimeType = action.payload.mimeType;
      if (state.blobUrl) {
        URL.revokeObjectURL(state.blobUrl);
        state.blobUrl = null;
      }
    },
    /** 暂停录音 */
    pauseRecording(state) {
      state.isPaused = true;
    },
    /** 恢复录音 */
    resumeRecording(state) {
      state.isPaused = false;
    },
    /** 更新录音时长 */
    tickRecordingDuration(state, action: PayloadAction<number>) {
      state.duration = action.payload;
    },
    /** 结束录音 */
    stopRecording(state, action: PayloadAction<string>) {
      state.isRecording = false;
      state.isPaused = false;
      state.blobUrl = action.payload;
    },
    /** 设置录音错误（含类型，供 LiveRecorder 弹窗引导） */
    setRecordingError(
      state,
      action: PayloadAction<{ message: string; type: RecordingState['errorType'] }>,
    ) {
      state.error = action.payload.message;
      state.errorType = action.payload.type;
      state.isRecording = false;
      state.isPaused = false;
    },
    /** 清除错误状态 */
    clearRecordingError(state) {
      state.error = null;
      state.errorType = null;
    },
    /** 重置录音状态 */
    resetRecording(state) {
      if (state.blobUrl) {
        URL.revokeObjectURL(state.blobUrl);
      }
      Object.assign(state, initialState);
    },
  },
});

export const {
  startRecording,
  pauseRecording,
  resumeRecording,
  tickRecordingDuration,
  stopRecording,
  setRecordingError,
  clearRecordingError,
  resetRecording,
} = recordingSlice.actions;

export default recordingSlice.reducer;

/**
 * MediaStream 与 MediaRecorder 不放入 Redux（不可序列化），
 * 由 useMediaRecorder Hook 在模块级 ref 中持有。
 */
export type { RecordingState };
