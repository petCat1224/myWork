import type { ReactNode } from 'react';
import type { ColumnType, TableProps } from 'antd/es/table';
import type {
  FilterValue,
  SorterResult,
  TableCurrentDataSource,
  TablePaginationConfig,
} from 'antd/es/table/interface';

/**
 * 排序方向，与 Ant Design Table 的 sortOrder 对齐。
 */
export type DataGridSortOrder = 'ascend' | 'descend' | null;

/**
 * 表格排序状态。
 * @template T 行数据类型
 */
export interface DataGridSortState<T extends object> {
  /** 参与排序的列字段 */
  field?: keyof T | string;
  /** 排序方向；null 表示未排序 */
  order?: DataGridSortOrder;
}

/**
 * 分页配置（B 端常用默认值可在组件内合并）。
 */
export interface DataGridPaginationConfig {
  /** 当前页码，从 1 开始 */
  current?: number;
  /** 每页条数 */
  pageSize?: number;
  /** 数据总条数 */
  total?: number;
  /** 是否展示每页条数切换器 */
  showSizeChanger?: boolean;
  /** 是否展示快速跳转 */
  showQuickJumper?: boolean;
  /** 每页条数选项 */
  pageSizeOptions?: (string | number)[];
  /** 自定义展示总条数文案 */
  showTotal?: TablePaginationConfig['showTotal'];
}

/**
 * 自定义列定义：在 Ant Design Column 基础上扩展业务语义。
 * @template T 行数据类型
 */
export interface DataGridColumn<T extends object> extends ColumnType<T> {
  /**
   * 是否开启排序；为 true 时使用 Ant Design 默认比较器，
   * 也可传入自定义 sorter 函数覆盖。
   */
  sortable?: boolean;
  /**
   * 自定义单元格渲染（语义化别名，等价于 ColumnType.render）。
   */
  customRender?: ColumnType<T>['render'];
}

/**
 * DataGrid 变更事件参数。
 * @template T 行数据类型
 */
export interface DataGridChangeParams<T extends object> {
  pagination: TablePaginationConfig;
  filters: Record<string, FilterValue | null>;
  sorter: SorterResult<T> | SorterResult<T>[];
  extra: TableCurrentDataSource<T>;
}

/**
 * DataGrid 组件 Props。
 * @template T 行数据类型，需为对象
 */
export interface DataGridProps<T extends object> {
  /** 列配置，支持 sortable 与 customRender */
  columns: DataGridColumn<T>[];
  /** 表格数据源 */
  dataSource: T[];
  /** 行唯一键，字符串字段名或取值函数 */
  rowKey: keyof T | ((record: T) => string);
  /** 是否处于加载中 */
  loading?: boolean;
  /**
   * 分页配置；传 false 关闭分页。
   * 受控使用时请同时传入 current / pageSize / total 与 onPaginationChange。
   */
  pagination?: false | DataGridPaginationConfig;
  /** 受控排序状态 */
  sort?: DataGridSortState<T>;
  /** 排序变更回调 */
  onSortChange?: (sort: DataGridSortState<T>) => void;
  /** 分页变更回调 */
  onPaginationChange?: (page: number, pageSize: number) => void;
  /** 透传 Ant Design Table 的 onChange */
  onChange?: TableProps<T>['onChange'];
  /** 空状态描述文案或节点 */
  emptyDescription?: ReactNode;
  /** 外层容器 className（Tailwind 工具类） */
  className?: string;
  /** 表格横向滚动宽度 */
  scrollX?: number | string;
  /** 表格尺寸 */
  size?: TableProps<T>['size'];
}
