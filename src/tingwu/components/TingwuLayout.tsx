import type { ReactNode } from 'react';
import { AudioOutlined, HomeOutlined, SettingOutlined } from '@ant-design/icons';
import { NavLink, Outlet } from 'react-router-dom';

import '../styles/tingwu.css';

interface TingwuLayoutProps {
  /** 主内容区域（嵌套路由时使用 Outlet，可选 children） */
  children?: ReactNode;
}

const NAV_ITEMS = [
  { to: '/tingwu', label: '我的记录', icon: <HomeOutlined /> },
  { to: '/tingwu/settings', label: '设置', icon: <SettingOutlined /> },
];

/**
 * 通义听悟风格全局布局（官方配色：#6155F5 主色）。
 * @param props - 布局属性
 * @returns 布局节点
 */
function TingwuLayout({ children }: TingwuLayoutProps) {
  return (
    <div className="tingwu-app flex min-h-screen">
      <aside className="tingwu-sidebar flex w-[220px] shrink-0 flex-col">
        <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#6155f5] text-lg text-white shadow-sm">
            <AudioOutlined />
          </div>
          <div>
            <p className="text-[15px] font-semibold text-[#1d2129]">通义听悟</p>
            <p className="text-xs text-[#86909c]">AI 听记助手</p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-3">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/tingwu'}
              className={({ isActive }) =>
                [
                  'flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors',
                  isActive ? 'tingwu-nav-active font-medium' : 'text-[#4e5969] hover:bg-gray-50',
                ].join(' ')
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-gray-100 px-4 py-4 text-xs leading-relaxed text-[#86909c]">
          Redux · wavesurfer.js · markdown-it
          <br />
          EventSource / ReadableStream
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">{children ?? <Outlet />}</main>
    </div>
  );
}

export default TingwuLayout;
