import styled from '@emotion/styled';
import {
  ColumnDef,
  ColumnResizeMode,
  getCoreRowModel as defaultGetCoreRowModel,
  getPaginationRowModel as defaultGetPaginationRowModel,
  getSortedRowModel as defaultGetSortedRowModel,
  flexRender,
  Row,
  RowModel,
  SortDirection,
  Table as TableType,
  useReactTable,
} from '@tanstack/react-table';

import { HTMLAttributes } from 'react';
import { consts } from 'styles';
import Pagination from './Pagination';

const paddingHorizontal = 0.5 * consts.lineHeight + 'em';
const paddingVertical = 0.375 * consts.lineHeight + 'em';

const TableWrapper = styled.div({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  overscrollBehavior: 'contain',
  boxOrient: 'vertical',
  boxDirection: 'normal',
});

const TableStyled = styled.div(({ theme }) => ({
  display: 'flex',
  flex: 'auto 1',
  flexDirection: 'column',
  alignItems: 'stretch',
  width: '100%',
  borderCollapse: 'collapse',
  overflow: 'auto',
  border: `1px solid ${theme.background}`,
  borderRadius: '0.125em',
  boxFlex: 1,
  boxOrient: 'vertical',
  boxDirection: 'normal',
  boxAlign: 'stretch',
}));

const TableHeader = styled.div({
  display: 'flex',
  flex: '1 1 auto',
  flexDirection: 'column',
  userSelect: 'none',
  boxFlex: 1,
  boxOrient: 'vertical',
  boxDirection: 'normal',
});

const TableBody = styled.div({
  display: 'flex',
  flex: '99999 1 auto',
  flexDirection: 'column',
  overflow: 'auto',
  boxFlex: 99999,
  boxOrient: 'vertical',
  boxDirection: 'normal',
});

const TableRow = styled.div<{
  header?: boolean;
  odd?: boolean;
  clickable?: boolean;
  dummy?: boolean;
}>(
  {
    flex: '1 0 auto',
    display: 'inline-flex',
    boxFlex: 1,
  },
  ({ header }) =>
    header && {
      textAlign: 'left',
      fontSize: '0.8125em',
      textTransform: 'uppercase',
      letterSpacing: '1px',
    },
  ({ odd }) =>
    odd && {
      background: 'rgba(0, 0, 0, 0.1)',
    },
  ({ clickable }) =>
    clickable && {
      cursor: 'pointer',
    },
  ({ dummy }) =>
    !dummy && {
      '&:hover': {
        background: 'rgba(255, 255, 255, 0.05)',
      },
    }
);

const TableCell = styled.div<{
  header?: boolean;
  resizing?: boolean;
  sortable?: boolean;
  sorted?: false | SortDirection;
  body?: boolean;
}>(
  {
    flex: `1 1 auto`,
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    padding: '7px 5px',
    overflow: 'hidden',
    transition: '0.3s ease',
    transitionProperty: `width, min-width, padding, opacity`,
    boxFlex: 1,
  },
  ({ header, theme }) =>
    header && {
      fontWeight: 'bold',
      lineHeight: 'normal',
      position: 'relative',
      backgroundColor: theme.background,
      padding: `${paddingVertical} ${paddingHorizontal}`,
      borderLeft: `1px solid ${theme.background}`,
      '&:last-child': {
        borderRight: 0,
      },
    },
  ({ resizing }) =>
    resizing && {
      transition: 'none',
      cursor: 'col-resize',
      userSelect: 'none',
    },
  ({ sortable }) => sortable && { cursor: 'pointer', outline: 'none' },
  ({ sorted, theme }) =>
    sorted === 'asc'
      ? { boxShadow: `inset 0 3px 0 0 ${theme.primary}` }
      : sorted === 'desc'
      ? { boxShadow: `inset 0 -3px 0 0 ${theme.primary}` }
      : {},
  ({ body, theme }) =>
    body && {
      padding: `${paddingVertical} ${paddingHorizontal}`,
      borderLeft: `1px solid ${theme.background}`,
      '&:first-of-type': {
        borderLeft: 0,
      },
    }
);

const NoData = styled.div({
  display: 'block',
  position: 'absolute',
  left: '50%',
  top: '50%',
  transform: 'translate(-50%, -50%)',
  background: 'rgba(255, 255, 255, 0.8)',
  transition: 'all 0.3s ease',
  zIndex: 1,
  pointerEvents: 'none',
  padding: 20,
  color: 'rgba(0, 0, 0, 0.5)',
});

const HeaderResizer = styled.div({
  display: 'inline-block',
  position: 'absolute',
  width: 36,
  top: 0,
  bottom: 0,
  right: -18,
  cursor: 'col-resize',
  zIndex: 10,
});

export interface TableProps<TData> extends HTMLAttributes<HTMLDivElement> {
  data: TData[];
  columns: ColumnDef<TData>[];
  defaultColumn?: Partial<ColumnDef<TData>>;
  getRowId?: (
    originalRow: TData,
    index: number,
    parent?: Row<TData> | undefined
  ) => string;
  enableColumnResizing?: boolean;
  enableSorting?: boolean;
  getCoreRowModel?: (table: TableType<TData>) => () => RowModel<TData>;
  getPaginationRowModel?: (table: TableType<any>) => () => RowModel<any>;
  getSortedRowModel?: (table: TableType<any>) => () => RowModel<any>;
  columnResizeMode?: ColumnResizeMode;
  onRowClick?: (row: Row<TData>, index: number) => void;
}

export default function Table<TData>({
  data,
  columns,
  defaultColumn,
  getRowId,
  enableColumnResizing = true,
  enableSorting = true,
  getCoreRowModel = defaultGetCoreRowModel(),
  getPaginationRowModel = defaultGetPaginationRowModel(),
  getSortedRowModel = defaultGetSortedRowModel(),
  columnResizeMode = 'onChange',
  onRowClick,
  ...rest
}: TableProps<TData>) {
  const table = useReactTable<TData>({
    data,
    columns,
    defaultColumn,
    getRowId,
    enableColumnResizing,
    enableSorting,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    columnResizeMode,
  });
  const rows = table.getPaginationRowModel().rows;
  const rowCount = rows.length;
  const pageSize = table.getState().pagination.pageSize;
  const dummyRows = Array.from(
    { length: pageSize - rowCount },
    (_v, i) => i + rowCount
  );
  return (
    <TableWrapper {...rest}>
      <TableStyled role="grid">
        <TableHeader>
          <TableRow header role="row">
            {table.getFlatHeaders().map((header) => (
              <TableCell
                header
                role="columnheader"
                key={header.id}
                resizing={header.column.getIsResizing()}
                style={{ width: header.getSize() }}
                sortable={header.column.getCanSort()}
                sorted={header.column.getIsSorted()}
                onClick={
                  header.column.getCanSort()
                    ? header.column.getToggleSortingHandler()
                    : undefined
                }
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                {header.column.getCanResize() && (
                  <HeaderResizer
                    onMouseDown={header.getResizeHandler()}
                    onTouchStart={header.getResizeHandler()}
                    style={{
                      transform:
                        columnResizeMode === 'onEnd' &&
                        header.column.getIsResizing()
                          ? `translateX(${
                              table.getState().columnSizingInfo.deltaOffset
                            }px)`
                          : '',
                    }}
                  />
                )}
              </TableCell>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {rows.map((row, i) => (
            <TableRow
              role="row"
              key={row.id}
              odd={i % 2 === 0}
              clickable={!!onRowClick}
              onClick={
                onRowClick
                  ? () => {
                      onRowClick(row, i);
                    }
                  : undefined
              }
            >
              {row.getAllCells().map((cell) => (
                <TableCell
                  body
                  role="gridcell"
                  key={cell.id}
                  resizing={cell.column.getIsResizing()}
                  style={{ width: cell.column.getSize() }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}

          {dummyRows.map((i) => (
            <TableRow dummy role="row" key={i} odd={i % 2 === 0}>
              {table.getAllColumns().map((column) => (
                <TableCell
                  body
                  role="gridcell"
                  key={column.id}
                  resizing={column.getIsResizing()}
                  style={{ width: column.getSize() }}
                >
                  &nbsp;
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </TableStyled>

      <Pagination table={table} />
      {!data?.length && <NoData>{__('No Rows Found')}</NoData>}
    </TableWrapper>
  );
}
