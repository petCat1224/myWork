import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface PlaybackState {
  /** 当前播放时间（秒） */
  currentTime: number;
  /** 是否播放中 */
  isPlaying: boolean;
  /** 播放倍速 */
  playbackRate: number;
  /** WaveSurfer 是否就绪 */
  ready: boolean;
  /** 外部请求跳转的时间点（秒） */
  seekRequest: number | null;
}

const initialState: PlaybackState = {
  currentTime: 0,
  isPlaying: false,
  playbackRate: 1,
  ready: false,
  seekRequest: null,
};

const playbackSlice = createSlice({
  name: 'playback',
  initialState,
  reducers: {
    /** 设置当前时间 */
    setCurrentTime(state, action: PayloadAction<number>) {
      state.currentTime = action.payload;
    },
    /** 设置播放状态 */
    setIsPlaying(state, action: PayloadAction<boolean>) {
      state.isPlaying = action.payload;
    },
    /** 设置倍速 */
    setPlaybackRate(state, action: PayloadAction<number>) {
      state.playbackRate = action.payload;
    },
    /** 设置 WaveSurfer 就绪 */
    setReady(state, action: PayloadAction<boolean>) {
      state.ready = action.payload;
    },
    /** 请求跳转到指定时间（由 WaveformPlayer 消费） */
    requestSeek(state, action: PayloadAction<number>) {
      state.seekRequest = action.payload;
    },
    /** 清除跳转请求 */
    clearSeekRequest(state) {
      state.seekRequest = null;
    },
    /** 重置播放状态 */
    resetPlayback() {
      return initialState;
    },
  },
});

export const {
  setCurrentTime,
  setIsPlaying,
  setPlaybackRate,
  setReady,
  requestSeek,
  clearSeekRequest,
  resetPlayback,
} = playbackSlice.actions;

export default playbackSlice.reducer;
