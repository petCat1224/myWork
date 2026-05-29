import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Alert, Button, Empty, Result, Spin } from 'antd';

import DetailHeader from '../components/DetailHeader';
import InsightPanel from '../components/InsightPanel';
import TranscriptPanel from '../components/TranscriptPanel';
import WaveformPlayer from '../components/WaveformPlayer';
import { useSSETranscription } from '../hooks/useSSETranscription';
import {
  fetchRecordDetail,
  resetDetail,
} from '../store/detailSlice';
import { resetChat } from '../store/chatSlice';
import { resetPlayback, requestSeek } from '../store/playbackSlice';
import { useTingwuDispatch, useTingwuSelector } from '../store/hooks';

/**
 * 听悟详情页：wavesurfer 波形 + 转写 + AI 洞察（Redux）。
 * @returns 详情页节点
 */
function RecordDetailPage() {
  const { recordId } = useParams<{ recordId: string }>();
  const dispatch = useTingwuDispatch();

  const { record, loading, error, streaming, streamError, audioBlobUrl } = useTingwuSelector(
    (state) => state.detail,
  );
  const currentTime = useTingwuSelector((state) => state.playback.currentTime);

  const isProcessing = record?.status === 'processing';
  useSSETranscription(recordId, Boolean(recordId && isProcessing && record.transcript.length === 0));

  useEffect(() => {
    if (recordId) {
      dispatch(fetchRecordDetail(recordId));
    }
    return () => {
      dispatch(resetDetail());
      dispatch(resetPlayback());
      dispatch(resetChat());
    };
  }, [dispatch, recordId]);

  /**
   * 请求波形跳转到指定时间。
   */
  const handleSeek = (time: number) => {
    dispatch(requestSeek(time));
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spin description="加载听记详情…" size="large" />
      </div>
    );
  }

  if (error && !record) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <Result
          status="warning"
          title={error}
          extra={
            <Link to="/tingwu">
              <Button type="primary">返回列表</Button>
            </Link>
          }
        />
      </div>
    );
  }

  if (!record) {
    return null;
  }

  const audioUrl = audioBlobUrl ?? record.audioUrl ?? null;

  return (
    <div className="tingwu-detail-grid flex flex-1 flex-col overflow-hidden">
      <DetailHeader record={record} />

      {(streaming || streamError) && (
        <div className="px-6 pt-3">
          {streaming && (
            <Alert
              type="info"
              showIcon
              message="流式转写进行中"
              description="Fetch ReadableStream / EventSource 正在推送转写片段…"
              className="tingwu-stream-badge"
            />
          )}
          {streamError && (
            <Alert type="error" showIcon title={streamError} className="mt-2" />
          )}
        </div>
      )}

      <div className="grid flex-1 gap-4 overflow-hidden p-4 lg:grid-cols-5 lg:p-6">
        <section className="flex min-h-0 flex-col gap-4 lg:col-span-3">
          <WaveformPlayer
            audioUrl={audioUrl}
            fallbackDuration={record.duration}
            onSeek={handleSeek}
          />
          <div className="min-h-0 flex-1">
            <TranscriptPanel
              segments={record.transcript}
              currentTime={currentTime}
              onSeek={handleSeek}
            />
          </div>
        </section>

        <section className="min-h-[480px] overflow-hidden lg:col-span-2">
          <InsightPanel record={record} onSeek={handleSeek} />
        </section>
      </div>

      {record.transcript.length === 0 && !streaming && (
        <div className="px-6 pb-6">
          <Empty description="暂无转写，可重新上传或等待 SSE 推送">
            <Button onClick={() => dispatch(fetchRecordDetail(record.id))}>刷新</Button>
          </Empty>
        </div>
      )}
    </div>
  );
}

export default RecordDetailPage;
