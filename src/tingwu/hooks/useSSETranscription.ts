import { useEffect, useRef } from 'react';

import { subscribeTranscriptionViaSSE } from '../services/transcriptionApi';
import {
  appendTranscriptSegment,
  setStreamError,
  setStreaming,
} from '../store/detailSlice';
import { useTingwuDispatch } from '../store/hooks';

/**
 * 通过 EventSource 订阅转写进度（处理中记录自动拉流）。
 * @param recordId - 记录 ID
 * @param enabled - 是否启用订阅
 */
export function useSSETranscription(recordId: string | undefined, enabled: boolean): void {
  const dispatch = useTingwuDispatch();
  const closeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!recordId || !enabled) {
      return undefined;
    }

    dispatch(setStreaming(true));
    closeRef.current = subscribeTranscriptionViaSSE(
      recordId,
      (event) => {
        if (event.type === 'segment' && event.segment) {
          dispatch(appendTranscriptSegment(event.segment));
        }
        if (event.type === 'error') {
          dispatch(setStreamError(event.message ?? 'SSE 转写失败'));
        }
        if (event.type === 'done') {
          dispatch(setStreaming(false));
        }
      },
      (message) => {
        dispatch(setStreamError(message));
      },
    );

    return () => {
      closeRef.current?.();
      closeRef.current = null;
    };
  }, [dispatch, enabled, recordId]);
}
