import { lazy, Suspense, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ConfigProvider, Spin } from 'antd';
import zhCN from 'antd/locale/zh_CN';

import SceneErrorBoundary from './components/SceneErrorBoundary';
import ContactForm from './pages/ContactForm';
import ProductIntroPage from './pages/ProductIntroPage';
import RequestAnimation from './assets/requestanimation';

const SnowForestScene = lazy(() => import('./pages/SnowForestScene'));
const TingwuApp = lazy(() => import('./tingwu/TingwuApp'));

const PAGES = {
  tingwu: { label: '通义听悟', next: 'requestanimation' },
  requestanimation: { label: '打字机效果', next: 'intro' },
  intro: { label: '联系表单', next: 'form' },
  form: { label: '冬日森林', next: 'snow' },
  snow: { label: '产品介绍', next: 'tingwu' },
};

/**
 * 应用根组件：演示页切换 + 听悟独立路由。
 * @returns 根节点
 */
export default function App() {
  const [page, setPage] = useState('tingwu');
  const { label, next } = PAGES[page];

  return (
    <ConfigProvider locale={zhCN}>
      <BrowserRouter>
        <SceneErrorBoundary>
          <Routes>
            <Route
              path="/tingwu/*"
              element={
                <Suspense
                  fallback={
                    <div className="flex min-h-screen items-center justify-center">
                      <Spin size="large" description="加载通义听悟…" />
                    </div>
                  }
                >
                  <TingwuApp />
                </Suspense>
              }
            />
            <Route
              path="*"
              element={
                <>
                  <button
                    type="button"
                    className="page-switch"
                    onClick={() => setPage(next)}
                  >
                    {label}
                  </button>
                  {page === 'requestanimation' && <RequestAnimation />}
                  {page === 'form' && <ContactForm />}
                  {page === 'intro' && <ProductIntroPage />}
                  {page === 'snow' && (
                    <Suspense fallback={<div className="scene-loading">3D 场景加载中…</div>}>
                      <SnowForestScene />
                    </Suspense>
                  )}
                  {page === 'tingwu' && <Navigate to="/tingwu" replace />}
                </>
              }
            />
          </Routes>
        </SceneErrorBoundary>
      </BrowserRouter>
    </ConfigProvider>
  );
}
