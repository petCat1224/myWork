import { useCallback, useMemo } from 'react';
import { Empty, Table } from 'antd';
import type { ColumnsType, TableProps } from 'antd/es/table';
import type { SorterResult } from 'antd/es/table/interface';

import type {
  DataGridColumn,
  DataGridProps,
  DataGridSortState,
} from './types';

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_PAGE_SIZE_OPTIONS = ['10', '20', '50', '100'];

/**
 * 从列定义中解析用于排序匹配的字段 key。
 * @param column - 列配置
 * @returns 字段 key 或 undefined
 */
function resolveColumnKey<T extends object>(
  column: DataGridColumn<T>,
): string | undefined {
  if (column.key != null) {
    return String(column.key);
  }
  if (column.dataIndex != null) {
    return Array.isArray(column.dataIndex)
      ? column.dataIndex.join('.')
      : String(column.dataIndex);
  }
  return undefined;
}

/**
 * 将业务列配置转换为 Ant Design Table 列，并注入排序状态。
 * @param columns - 原始列配置
 * @param sort - 当前排序状态
 * @returns Ant Design 列配置
 */
function buildTableColumns<T extends object>(
  columns: DataGridColumn<T>[],
  sort?: DataGridSortState<T>,
): ColumnsType<T> {
  return columns.map((column) => {
    const columnKey = resolveColumnKey(column);
    const isActiveSort =
      sort?.field != null && columnKey != null && String(sort.field) === columnKey;

    const { sortable, customRender, ...rest } = column;

    return {
      ...rest,
      render: customRender ?? column.render,
      sorter: sortable ? (column.sorter ?? true) : column.sorter,
      sortOrder: isActiveSort ? sort?.order : undefined,
    };
  });
}

/**
 * 解析 Table onChange 中的 sorter（兼容单列与多列）。
 * @param sorter - Ant Design 传入的排序结果
 * @returns 首个排序结果
 */
function normalizeSorter<T extends object>(
  sorter: SorterResult<T> | SorterResult<T>[],
): SorterResult<T> {
  return Array.isArray(sorter) ? sorter[0] : sorter;
}

/**
 * B 端通用 DataGrid：基于 Ant Design Table，支持分页、排序、自定义列，
 * 并统一处理 Loading 与 Empty 状态。外层使用 TailwindCSS 做布局与视觉。
 *
 * @template T 行数据类型
 * @param props - 组件属性
 * @returns DataGrid 表格节点
 *
 * @example
 * ```tsx
 * <DataGrid
 *   rowKey="id"
 *   loading={loading}
 *   dataSource={list}
 *   columns={[
 *     { title: '名称', dataIndex: 'name', sortable: true },
 *     {
 *       title: '状态',
 *       dataIndex: 'status',
 *       customRender: (value) => <Tag>{value}</Tag>,
 *     },
 *   ]}
 *   pagination={{ current: 1, pageSize: 10, total: 100 }}
 *   onPaginationChange={(page, pageSize) => fetchList(page, pageSize)}
 *   onSortChange={(sort) => fetchList({ sort })}
 * />
 * ```
 */
function DataGrid<T extends object>({
  columns,
  dataSource,
  rowKey,
  loading = false,
  pagination,
  sort,
  onSortChange,
  onPaginationChange,
  onChange,
  emptyDescription = '暂无数据',
  className = '',
  scrollX = 'max-content',
  size = 'middle',
}: DataGridProps<T>) {
  const tableColumns = useMemo(
    () => buildTableColumns(columns, sort),
    [columns, sort],
  );

  const paginationConfig = useMemo<TableProps<T>['pagination']>(() => {
    if (pagination === false) {
      return false;
    }

    const {
      current = 1,
      pageSize = DEFAULT_PAGE_SIZE,
      total = 0,
      showSizeChanger = true,
      showQuickJumper = true,
      pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
      showTotal = (count: number) => `共 ${count} 条`,
      ...rest
    } = pagination ?? {};

    return {
      current,
      pageSize,
      total,
      showSizeChanger,
      showQuickJumper,
      pageSizeOptions,
      showTotal,
      ...rest,
    };
  }, [pagination]);

  const emptyNode = useMemo(
    () => (
      <div className="flex flex-col items-center justify-center py-16">
        <Empty description={emptyDescription} />
      </div>
    ),
    [emptyDescription],
  );

  /**
   * 统一处理分页、排序变更，并回调业务层。
   */
  const handleTableChange = useCallback<NonNullable<TableProps<T>['onChange']>>(
    (nextPagination, filters, sorter, extra) => {
      const sorterResult = normalizeSorter(sorter);

      if (onSortChange) {
        onSortChange({
          field: sorterResult?.field as DataGridSortState<T>['field'],
          order: sorterResult?.order ?? null,
        });
      }

      if (onPaginationChange && nextPagination) {
        onPaginationChange(
          nextPagination.current ?? 1,
          nextPagination.pageSize ?? DEFAULT_PAGE_SIZE,
        );
      }

      onChange?.(nextPagination, filters, sorter, extra);
    },
    [onChange, onPaginationChange, onSortChange],
  );

  const wrapperClassName = [
    'w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={wrapperClassName} data-testid="data-grid">
      <Table<T>
        rowKey={rowKey}
        columns={tableColumns}
        dataSource={dataSource}
        loading={loading}
        pagination={paginationConfig}
        onChange={handleTableChange}
        scroll={{ x: scrollX }}
        size={size}
        locale={{ emptyText: emptyNode }}
        className="[&_.ant-table]:text-sm"
      />
    </div>
  );
}

export default DataGrid;
