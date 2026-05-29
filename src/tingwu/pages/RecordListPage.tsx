import { useEffect, useState } from 'react';
import { ReloadOutlined } from '@ant-design/icons';
import { Alert, Button, Input, Select } from 'antd';
import LiveRecorder from '../components/LiveRecorder';
import RecordList from '../components/RecordList';
import UploadZone from '../components/UploadZone';
import { fetchRecords, setQuery } from '../store/recordsSlice';
import { useTingwuDispatch, useTingwuSelector } from '../store/hooks';
import type { TingwuRecordStatus } from '../types';
import { USE_REAL_API } from '../config/api';

const STATUS_OPTIONS = [
  { value: 'all', label: '全部状态' },
  { value: 'completed', label: '已完成' },
  { value: 'processing', label: '处理中' },
  { value: 'failed', label: '处理失败' },
];

/**
 * 听悟首页：实时录音 + 上传 + 列表（Redux 状态管理）。
 * @returns 首页节点
 */
function RecordListPage() {
  const dispatch = useTingwuDispatch();
  const { items, loading, query } = useTingwuSelector((state) => state.records);
  const [keyword, setKeyword] = useState(query.keyword ?? '');

  useEffect(() => {
    dispatch(fetchRecords(query));
  }, []);

  /**
   * 提交搜索。
   */
  const handleSearch = () => {
    dispatch(setQuery({ ...query, keyword }));
    dispatch(fetchRecords({ ...query, keyword }));
  
  };
 
  

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-8 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[#1d2129]">我的听记</h1>
        <p className="mt-1 text-sm text-[#86909c]">
          录音 · 上传 · 流式转写 · AI 导读与问答
        </p>
      </div>

      {!USE_REAL_API && (
        <Alert
          type="info"
          showIcon
          className="mb-4"
          message="当前为 Mock 模式"
          description="配置 .env 中 VITE_TINGWU_API_BASE 可对接真实转写 API（Fetch Stream + EventSource）。"
        />
      )}

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <LiveRecorder />
        <UploadZone />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Input.Search
          allowClear
          placeholder="搜索标题或标签"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onSearch={handleSearch}
          className="max-w-xs"
        />
        <Select
          value={query.status ?? 'all'}
          options={STATUS_OPTIONS}
          className="w-32"
          onChange={(status) => {
            const next = { ...query, status: status as TingwuRecordStatus | 'all' };
            dispatch(setQuery(next));
            dispatch(fetchRecords(next));

            
          }}
        />
        <Button icon={<ReloadOutlined />} onClick={() => dispatch(fetchRecords(query))}>
          刷新
        </Button>
      </div>

      <RecordList records={items} loading={loading} />
    </div>
  );
}

export default RecordListPage;
