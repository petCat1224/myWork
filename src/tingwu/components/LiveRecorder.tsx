import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AudioOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { Alert, Button, Modal, message } from 'antd';

import { useMediaRecorder } from '../hooks/useMediaRecorder';
import { addLocalRecord } from '../store/recordsSlice';
import {
  initLiveRecord,
  setAudioBlobUrl,
  startFetchStreamTranscription,
} from '../store/detailSlice';
import { useTingwuDispatch } from '../store/hooks';
import { formatDuration } from '../utils/format';

/**
 * 实时录音 UI：点击「开始录音」→ getUserMedia 申请权限 → MediaRecorder 编码。
 */
function LiveRecorder() {
  const dispatch = useTingwuDispatch();
  const navigate = useNavigate();
  const {
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
  } = useMediaRecorder();

  /**
   * 权限类错误时弹出引导 Modal（浏览器原生权限框只能由 getUserMedia 触发，这里做说明引导）。
   */
  useEffect(() => {
    if (errorType !== 'permission' || !error) {
      return;
    }

    Modal.warning({
      title: '需要麦克风权限',
      content: (
        <div className="space-y-2 text-sm leading-relaxed">
          <p>{error}</p>
          <p className="text-gray-500">
            若未看到浏览器弹窗，通常是因为之前选择了「禁止」。请点击地址栏左侧的锁/设置图标，将麦克风设为「允许」后，再点「开始录音」。
          </p>
        </div>
      ),
      okText: '我知道了',
      onOk: clearError,
    });
  }, [clearError, error, errorType]);

  /**
   * 停止录音 → 写入 Redux 听记列表 → 跳转详情页 → Fetch 流式转写。
   */
  const handleStopAndTranscribe = async () => {
    const blob = await stop();
    if (!blob) {
      message.warning('未获取到录音数据');
      return;
    }

    const url = URL.createObjectURL(blob);
    const recordId = `live-${Date.now()}`;
    const title = `实时录音 ${new Date().toLocaleString('zh-CN')}`;

    dispatch(
      addLocalRecord({
        id: recordId,
        title,
        duration,
        status: 'processing',
        source: 'live',
        createdAt: new Date().toISOString(),
        tags: ['实时录音'],
      }),
    );

    dispatch(initLiveRecord({ id: recordId, title, audioBlobUrl: url, duration }));
    dispatch(setAudioBlobUrl(url));

    const file = new File([blob], `${recordId}.webm`, { type: blob.type });
    dispatch(startFetchStreamTranscription({ file, recordId }));

    message.success('录音已保存，正在流式转写…');
    navigate(`/tingwu/record/${recordId}`);
  };

  return (
    <div className="rounded-xl border border-[#6155f5]/20 bg-gradient-to-br from-[#6155f5]/5 to-white p-5">
      <div className="mb-3 flex items-center gap-2">
        <AudioOutlined className="text-[#6155f5]" />
        <h3 className="text-base font-semibold text-gray-900">实时录音</h3>
      </div>

      <p className="mb-4 text-sm text-gray-500">
        点击「开始录音」后，浏览器会询问是否允许使用麦克风（首次访问时）。
      </p>

      {error && errorType !== 'permission' && (
        <Alert type="error" title={error} showIcon closable onClose={clearError} className="mb-3" />
      )}

      <div className="flex flex-wrap items-center gap-3">
        {!isRecording ? (
          <Button type="primary" icon={<AudioOutlined />} onClick={start}>
            开始录音
          </Button>
        ) : (
          <>
            <span className="font-mono text-sm text-[#6155f5]">
              {isPaused ? '已暂停' : '录音中'} · {formatDuration(duration)}
            </span>
            {isPaused ? (
              <Button icon={<PlayCircleOutlined />} onClick={resume}>
                继续
              </Button>
            ) : (
              <Button icon={<PauseCircleOutlined />} onClick={pause}>
                暂停
              </Button>
            )}
            <Button danger icon={<StopOutlined />} onClick={handleStopAndTranscribe}>
              停止并转写
            </Button>
          </>
        )}

        {blobUrl && !isRecording && (
          <audio controls src={blobUrl} className="h-8 max-w-xs">
            <track kind="captions" />
          </audio>
        )}
      </div>
    </div>
  );
}

export default LiveRecorder;
