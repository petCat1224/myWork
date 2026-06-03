import React from 'react'
import { ConfigProvider, Empty } from 'antd';

function SettingsPage() {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
        <div class='text-[40px]'>确定</div>
    <Empty description="设置页（演示占位）" />
  </div>
  )
}

export default SettingsPage 