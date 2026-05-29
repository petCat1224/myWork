import { InboxOutlined } from '@ant-design/icons';
import { message, Upload } from 'antd';
import type { UploadProps } from 'antd';
import { useNavigate } from 'react-router-dom';

import { addLocalRecord } from '../store/recordsSlice';
import { startFetchStreamTranscription } from '../store/detailSlice';
import { useTingwuDispatch } from '../store/hooks';

/**
 * 文件上传：经 Node 中间层调用 DashScope Paraformer 转写。
 */
function UploadZone() {
  const dispatch = useTingwuDispatch();
  const navigate = useNavigate();

  const uploadProps: UploadProps = {
    multiple: false,
    accept: 'audio/*,video/*,.mp3,.mp4,.wav,.m4a,.webm',
    showUploadList: false,
    beforeUpload: async (file) => {
      const recordId = `upload-${Date.now()}`;

      dispatch(
        addLocalRecord({
          id: recordId,
          title: file.name.replace(/\.[^.]+$/, ''),
          duration: 0,
          status: 'processing',
          source: 'upload',
          createdAt: new Date().toISOString(),
          tags: ['本地上传'],
        }),
      );

      message.loading({ content: '正在调用 DashScope 转写…', key: 'transcribe', duration: 0 });

      navigate(`/tingwu/record/${recordId}`);

      await dispatch(
        startFetchStreamTranscription({ file, recordId }),
      );

      message.success({ content: '转写完成', key: 'transcribe' });
      return false;
    },
  };

  return (
    <div className="tingwu-panel rounded-xl border-dashed border-[#6155f5]/40 bg-gradient-to-br from-[#6155f5]/5 to-white p-6">
      <Upload.Dragger {...uploadProps} className="!border-none !bg-transparent">
        <p className="ant-upload-drag-icon">
          <InboxOutlined className="text-4xl text-[#6155f5]" />
        </p>
        <p className="text-base font-medium text-gray-800">
          拖拽音视频到此处，或点击上传
        </p>
        <p className="text-sm text-gray-500">
          Node 中间层 → DashScope Paraformer · 支持 MP3 / WAV / WebM
        </p>
      </Upload.Dragger>
    </div>
  );
}

export default UploadZone;
