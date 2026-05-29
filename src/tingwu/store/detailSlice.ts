import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { MOCK_RECORD_DETAILS, MOCK_RECORD_SUMMARIES } from '../mock/records';
import {
  consumeTranscriptionStream,
  streamTranscriptionViaFetch,
} from '../services/transcriptionApi';
import type { TingwuRecordDetail, TingwuTranscriptSegment } from '../types';

interface DetailState {
  record: TingwuRecordDetail | null;
  loading: boolean;
  error: string | null;
  streaming: boolean;
  streamError: string | null;
  audioBlobUrl: string | null;
}

const initialState: DetailState = {
  record: null,
  loading: false,
  error: null,
  streaming: false,
  streamError: null,
  audioBlobUrl: null,
};

/**
 * 拉取听记详情。
 */
export const fetchRecordDetail = createAsyncThunk(
  'detail/fetchRecordDetail',
  async (recordId: string) => {
    await new Promise((resolve) => {
      setTimeout(resolve, 400);
    });

    const summary = MOCK_RECORD_SUMMARIES.find((item) => item.id === recordId);
    // 本地上传/录音生成的 ID（upload-* / live-*）走详情页流式转写，不走 Mock 列表
    if (!summary && (recordId.startsWith('upload-') || recordId.startsWith('live-'))) {
      return {
        id: recordId,
        title: recordId.startsWith('live-') ? '实时录音' : '本地上传',
        duration: 0,
        status: 'processing',
        source: recordId.startsWith('live-') ? 'live' : 'upload',
        createdAt: new Date().toISOString(),
        tags: [],
        overview: '## 转写中\n\n正在通过 DashScope 生成导读…',
        transcript: [],
        chapters: [],
        speakers: [],
        keyPoints: [],
        chatHistory: [],
      } satisfies TingwuRecordDetail;
    }
    if (!summary) {
      throw new Error('记录不存在');
    }
    if (summary.status === 'processing') {
      return {
        ...summary,
        overview: '## 处理中\n\n正在通过 **EventSource** 接收转写流…',
        transcript: [],
        chapters: [],
        speakers: [],
        keyPoints: [],
        chatHistory: [],
      } satisfies TingwuRecordDetail;
    }
    if (summary.status === 'failed') {
      throw new Error('记录处理失败，请重新上传');
    }

    const detail = MOCK_RECORD_DETAILS[recordId];
    if (detail) {
      return detail;
    }

    return {
      ...summary,
      overview: '## 导读\n\n暂无 AI 导读，可点击「重新转写」触发流式转写。',
      transcript: [],
      chapters: [],
      speakers: [],
      keyPoints: [],
      chatHistory: [],
    } satisfies TingwuRecordDetail;
  },
);

/**
 * 通过 Fetch ReadableStream 流式转写（上传/录音文件）。
 * @param payload.file - 音频文件
 * @param payload.recordId - 记录 ID（与 Node jobStore 关联）
 */
export const startFetchStreamTranscription = createAsyncThunk(
  'detail/startFetchStreamTranscription',
  async (
    payload: { file: File; recordId?: string },
    { dispatch, signal },
  ) => {
    const { file, recordId } = payload;
    await consumeTranscriptionStream(
      streamTranscriptionViaFetch(file, recordId, signal),
      (event) => {
        if (event.type === 'segment' && event.segment) {
          dispatch(appendTranscriptSegment(event.segment));
        }
        if (event.type === 'overview' && event.overview) {
          dispatch(setOverviewMarkdown(event.overview));
        }
        if (event.type === 'error') {
          dispatch(setStreamError(event.message ?? '转写失败'));
        }
      },
      signal,
    );
  },
);

const detailSlice = createSlice({
  name: 'detail',
  initialState,
  reducers: {
    resetDetail(state) {
      if (state.audioBlobUrl) {
        URL.revokeObjectURL(state.audioBlobUrl);
      }
      Object.assign(state, initialState);
    },
    setAudioBlobUrl(state, action: PayloadAction<string | null>) {
      if (state.audioBlobUrl && state.audioBlobUrl !== action.payload) {
        URL.revokeObjectURL(state.audioBlobUrl);
      }
      state.audioBlobUrl = action.payload;
    },
    setStreaming(state, action: PayloadAction<boolean>) {
      state.streaming = action.payload;
    },
    setStreamError(state, action: PayloadAction<string>) {
      state.streamError = action.payload;
      state.streaming = false;
    },
    clearStreamError(state) {
      state.streamError = null;
    },
    appendTranscriptSegment(state, action: PayloadAction<TingwuTranscriptSegment>) {
      if (!state.record) {
        return;
      }
      state.record.transcript.push(action.payload);
      state.record.status = 'completed';
    },
    setOverviewMarkdown(state, action: PayloadAction<string>) {
      if (state.record) {
        state.record.overview = action.payload;
      }
    },
    initLiveRecord(
      state,
      action: PayloadAction<{ id: string; title: string; audioBlobUrl: string; duration: number }>,
    ) {
      const { id, title, audioBlobUrl, duration } = action.payload;
      state.record = {
        id,
        title,
        duration,
        status: 'processing',
        source: 'live',
        createdAt: new Date().toISOString(),
        tags: ['实时录音'],
        overview: '## 实时听记\n\n转写进行中…',
        transcript: [],
        chapters: [],
        speakers: [],
        keyPoints: [],
        chatHistory: [],
        audioUrl: audioBlobUrl,
      };
      state.audioBlobUrl = audioBlobUrl;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecordDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecordDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.record = action.payload;
      })
      .addCase(fetchRecordDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? '加载失败';
        state.record = null;
      })
      .addCase(startFetchStreamTranscription.pending, (state) => {
        state.streaming = true;
        state.streamError = null;
      })
      .addCase(startFetchStreamTranscription.fulfilled, (state) => {
        state.streaming = false;
      })
      .addCase(startFetchStreamTranscription.rejected, (state, action) => {
        if (action.meta.aborted) {
          return;
        }
        state.streaming = false;
        state.streamError = action.error.message ?? '流式转写失败';
      });
  },
});

export const {
  resetDetail,
  setAudioBlobUrl,
  setStreaming,
  setStreamError,
  clearStreamError,
  appendTranscriptSegment,
  setOverviewMarkdown,
  initLiveRecord,
} = detailSlice.actions;

export default detailSlice.reducer;
