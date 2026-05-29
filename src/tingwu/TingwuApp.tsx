import { Provider } from 'react-redux';
import { ConfigProvider, Empty } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { Navigate, Route, Routes } from 'react-router-dom';

import TingwuLayout from './components/TingwuLayout';
import RecordDetailPage from './pages/RecordDetailPage';
import RecordListPage from './pages/RecordListPage';
import { tingwuStore } from './store';

/**
 * 设置页占位。
 * @returns 设置页节点
 */
function SettingsPage() {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <Empty description="设置页（演示占位）" />
    </div>
  );
}

/**
 * 通义听悟应用入口（Redux Provider + 路由）。
 * @returns 应用根节点
 */
function TingwuApp() {
  return (
    <Provider store={tingwuStore}>
      <ConfigProvider
        locale={zhCN}
        theme={{
          token: {
            colorPrimary: '#6155f5',
            borderRadius: 8,
          },
        }}
      >
        <Routes>
        <Route path="/" element={<TingwuLayout />}>
          <Route index element={<RecordListPage />} />
          <Route path="record/:recordId" element={<RecordDetailPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/tingwu" replace />} />
        </Route>
      </Routes>
      </ConfigProvider>
    </Provider>
  );
}

export default TingwuApp;
