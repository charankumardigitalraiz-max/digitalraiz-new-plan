import React from 'react';
import { Inbox } from 'lucide-react';
import { Pagination } from './Pagination';

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  render?: (item: T, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

export interface TablePaginationProps {
  currentPage: number;
  pageSize: number;
  totalItems?: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  itemName?: string;
  /**
   * If true (default), Table will automatically slice the `data` array based on currentPage and pageSize.
   * If false, `data` is assumed to be already sliced by the caller.
   */
  autoSlice?: boolean;
}

export interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T, index: number) => string | number;
  emptyMessage?: string;
  emptySubtext?: string;
  emptyIcon?: React.ComponentType<{ className?: string }>;
  isLoading?: boolean;
  onRowClick?: (item: T, index: number) => void;
  className?: string;
  containerClassName?: string;
  hoverable?: boolean;
  hoverClassName?: string;
  rowClassName?: string | ((item: T, index: number) => string);
  pagination?: TablePaginationProps;
}

export function Table<T>({
  data,
  columns,
  keyExtractor,
  emptyMessage = 'No records found',
  emptySubtext,
  emptyIcon: EmptyIcon = Inbox,
  isLoading = false,
  onRowClick,
  className = '',
  containerClassName = '',
  hoverable = true,
  hoverClassName = 'hover:bg-sidebar-active',
  rowClassName,
  pagination
}: TableProps<T>) {
  // Determine displayed rows (handle client-side auto-slicing if pagination is configured)
  const totalCount = pagination?.totalItems !== undefined ? pagination.totalItems : data.length;
  const shouldAutoSlice = pagination && pagination.autoSlice !== false;

  const displayedData = shouldAutoSlice
    ? data.slice(
      (pagination.currentPage - 1) * pagination.pageSize,
      pagination.currentPage * pagination.pageSize
    )
    : data;

  const getAlignmentClass = (align?: 'left' | 'center' | 'right') => {
    switch (align) {
      case 'center':
        return 'text-center';
      case 'right':
        return 'text-right';
      default:
        return 'text-left';
    }
  };

  return (
    <div
      className={`overflow-hidden rounded-lg border border-slate-200/90 bg-white shadow-2xs ${containerClassName}`}
    >
      <div className="overflow-x-auto">
        <table className={`w-full text-left text-xs ${className}`}>
          <thead className="border-b border-slate-200/80 bg-slate-50/80 text-[11px] font-medium tracking-wide text-slate-600 uppercase select-none">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={col.width ? { width: col.width, minWidth: col.width } : undefined}
                  className={`px-5 py-3.5  ${getAlignmentClass(col.align)} ${col.headerClassName || ''
                    }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600" />
                    <span className="text-xs">Loading data...</span>
                  </div>
                </td>
              </tr>
            ) : displayedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-12 text-center">
                  <EmptyIcon className="mx-auto h-9 w-9 text-slate-300 mb-2" />
                  <h4 className="text-xs font-semibold text-slate-700">{emptyMessage}</h4>
                  {emptySubtext && (
                    <p className="mt-1 text-[11px] text-slate-400 max-w-sm mx-auto">
                      {emptySubtext}
                    </p>
                  )}
                </td>
              </tr>
            ) : (
              displayedData.map((item, index) => {
                const key = keyExtractor(item, index);
                return (
                  <tr
                    key={key}
                    onClick={() => onRowClick?.(item, index)}
                    className={`transition-colors duration-150 ${hoverable ? hoverClassName : ''
                      } ${onRowClick ? 'cursor-pointer' : ''} ${typeof rowClassName === 'function'
                        ? rowClassName(item, index)
                        : (rowClassName || '')
                      }`}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        style={col.width ? { width: col.width, minWidth: col.width } : undefined}
                        className={`px-5 py-4 ${getAlignmentClass(col.align)} ${col.className || ''
                          }`}
                      >
                        {col.render
                          ? col.render(item, index)
                          : ((item as Record<string, unknown>)[col.key] as React.ReactNode)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination && totalCount > 0 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalItems={totalCount}
          pageSize={pagination.pageSize}
          onPageChange={pagination.onPageChange}
          onPageSizeChange={pagination.onPageSizeChange}
          pageSizeOptions={pagination.pageSizeOptions}
          itemName={pagination.itemName}
        />
      )}
    </div>
  );
}
