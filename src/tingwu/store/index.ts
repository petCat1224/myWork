import { configureStore } from '@reduxjs/toolkit';

import chatReducer from './chatSlice';
import detailReducer from './detailSlice';
import playbackReducer from './playbackSlice';
import recordingReducer from './recordingSlice';
import recordsReducer from './recordsSlice';

/**
 * 通义听悟 Redux Store。
 */
export const tingwuStore = configureStore({
  reducer: {
    records: recordsReducer,
    detail: detailReducer,
    playback: playbackReducer,
    recording: recordingReducer,
    chat: chatReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'detail/startFetchStreamTranscription/pending',
          'detail/startFetchStreamTranscription/fulfilled',
          'detail/startSSETranscription/pending',
        ],
      },
    }),
});

export type TingwuRootState = ReturnType<typeof tingwuStore.getState>;
export type TingwuAppDispatch = typeof tingwuStore.dispatch;
