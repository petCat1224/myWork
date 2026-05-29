import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { MOCK_RECORD_SUMMARIES } from '../mock/records';
import type { TingwuListQuery, TingwuRecordSummary } from '../types';

interface RecordsState {
  items: TingwuRecordSummary[];
  loading: boolean;
  error: string | null;
  query: TingwuListQuery;
}

const initialState: RecordsState = {
  items: [],
  loading: false,
  error: null,
  query: {},
};

/**
 * 异步拉取听记列表（Mock / 可替换为真实 API）。
 */
export const fetchRecords = createAsyncThunk(
  'records/fetchRecords',
  async (query: TingwuListQuery) => {
    await new Promise((resolve) => {
      setTimeout(resolve, 500);
    });

    let result = [...MOCK_RECORD_SUMMARIES];

    if (query.keyword?.trim()) {
      const kw = query.keyword.trim().toLowerCase();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(kw) ||
          item.tags.some((tag) => tag.toLowerCase().includes(kw)),
      );
    }

    if (query.status && query.status !== 'all') {
      result = result.filter((item) => item.status === query.status);
    }

    return { items: result, query };
  },
);

/**
 * 新增本地听记记录（录音 / 上传完成后）。
 */
export const addLocalRecord = createAsyncThunk(
  'records/addLocalRecord',
  async (record: TingwuRecordSummary) => record,
);

const recordsSlice = createSlice({
  name: 'records',
  initialState,
  reducers: {
    /**
     * 更新列表查询条件（不自动请求）。
     */
    setQuery(state, action: PayloadAction<TingwuListQuery>) {
      // console.log('setQuery1111',state);
      state.query = action.payload;
      state.loading=false
    },
    /**
     * 更新某条记录状态。
     */
    patchRecordStatus(
      state,
      action: PayloadAction<{ id: string; status: TingwuRecordSummary['status'] }>,
    ) {
      const target = state.items.find((item) => item.id === action.payload.id);
      if (target) {
        target.status = action.payload.status;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecords.pending, (state, action) => {
        // console.log('🚀 开始搜索:', action.meta.arg);
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecords.fulfilled, (state, action) => {
        // console.log('fetchRecords.fulfilled2222',state);
        
        state.loading = false;
        state.items = action.payload.items;
        state.query = action.payload.query;
      })
      .addCase(fetchRecords.rejected, (state, action) => {
        console.log('fetchRecords.rejected3333',state);
        state.loading = false;
        state.error = action.error.message ?? '加载失败';
        state.items = [];
      })
      .addCase(addLocalRecord.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      });
  },
});

export const { setQuery, patchRecordStatus } = recordsSlice.actions;
export default recordsSlice.reducer;
