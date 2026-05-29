import { useCallback, useEffect, useState } from 'react';
import { ConfigProvider, Tag } from 'antd';
import zhCN from 'antd/locale/zh_CN';

import { DataGrid } from '../components/DataGrid';
import type { DataGridColumn, DataGridSortState } from '../components/DataGrid';

interface UserRecord {
  id: string;
  name: string;
  department: string;
  status: 'active' | 'inactive';
  updatedAt: string;
}

const MOCK_DATA: UserRecord[] = Array.from({ length: 48 }, (_, index) => {
  const id = index + 1;
  return {
    id: String(id),
    name: `用户 ${id}`,
    department: ['研发部', '产品部', '运营部'][index % 3],
    status: index % 4 === 0 ? 'inactive' : 'active',
    updatedAt: `2026-05-${String((index % 28) + 1).padStart(2, '0')} 10:00`,
  };
});

const COLUMNS: DataGridColumn<UserRecord>[] = [
  { title: 'ID', dataIndex: 'id', width: 80, sortable: true },
  { title: '姓名', dataIndex: 'name', sortable: true },
  { title: '部门', dataIndex: 'department' },
  {
    title: '状态',
    dataIndex: 'status',
    customRender: (status: UserRecord['status']) => (
      <Tag color={status === 'active' ? 'success' : 'default'}>
        {status === 'active' ? '启用' : '停用'}
      </Tag>
    ),
  },
  { title: '更新时间', dataIndex: 'updatedAt', width: 180, sortable: true },
];

/**
 * DataGrid 使用示例页（分页 + 排序 + 自定义列 + Loading / Empty）。
 */
export default function DataGridDemo() {
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sort, setSort] = useState<DataGridSortState<UserRecord>>({});
  const [rows, setRows] = useState<UserRecord[]>([]);
  const [total, setTotal] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    await new Promise((resolve) => {
      setTimeout(resolve, 400);
    });

    const sorted = [...MOCK_DATA].sort((a, b) => {
      if (!sort.field || !sort.order) {
        return 0;
      }
      const field = sort.field as keyof UserRecord;
      const left = String(a[field]);
      const right = String(b[field]);
      const result = left.localeCompare(right, 'zh-CN');
      return sort.order === 'ascend' ? result : -result;
    });

    const start = (page - 1) * pageSize;
    const slice = sorted.slice(start, start + pageSize);

    setRows(slice);
    setTotal(MOCK_DATA.length);
    setLoading(false);
  }, [page, pageSize, sort]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <ConfigProvider locale={zhCN}>
      <div className="min-h-screen bg-gray-50 p-6">
        <h1 className="mb-4 text-xl font-semibold text-gray-900">用户列表</h1>
        <DataGrid<UserRecord>
          rowKey="id"
          loading={loading}
          columns={COLUMNS}
          dataSource={rows}
          sort={sort}
          onSortChange={setSort}
          pagination={{ current: page, pageSize, total }}
          onPaginationChange={(nextPage, nextPageSize) => {
            setPage(nextPage);
            setPageSize(nextPageSize);
          }}
          emptyDescription="暂无用户数据"
        />
      </div>
    </ConfigProvider>
  );
}
