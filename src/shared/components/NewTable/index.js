import styled from '@emotion/styled';
import {
  useReactTable,
  flexRender,
  getCoreRowModel as defaultGetCoreRowModel,
} from '@tanstack/react-table';
import { consts } from 'styles';

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
  flex: '1 0 auto',
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

const TableRow = styled.div(
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
    }
);

const TableCell = styled.div(
  {
    flex: `1 0 0`,
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
      lineHeight: 'normal',
      position: 'relative',
      backgroundColor: theme.background,
      padding: `${paddingVertical} ${paddingHorizontal}`,
      borderLeft: `1px solid ${theme.background}`,
    },
  ({ body, theme }) =>
    body && {
      padding: `${paddingVertical} ${paddingHorizontal}`,
      borderLeft: `1px solid ${theme.background}`,
      '&:first-of-type': {
        borderLeft: 0,
      },
    }
);

export default function Table({
  data,
  columns,
  defaultColumn,
  getRowId,
  getCoreRowModel = defaultGetCoreRowModel(),
  ...rest
}) {
  const table = useReactTable({
    data,
    columns,
    defaultColumn,
    getRowId,
    getCoreRowModel,
  });
  console.log('options', {
    data,
    columns,
    defaultColumn,
    getRowId,
    getCoreRowModel,
  });
  console.log('table', table, table.getSortedRowModel());
  return (
    <TableWrapper>
      <TableStyled role="grid" {...rest}>
        <TableHeader>
          <TableRow header role="row">
            {table.getFlatHeaders().map((header) => (
              <TableCell header role="columnheader" key={header.id}>
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
              </TableCell>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {table.getRowModel().flatRows.map((row) => (
            <TableRow role="row" key={row.id}>
              {row.getAllCells().map((cell) => (
                <TableCell body role="gridcell" key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </TableStyled>
    </TableWrapper>
  );
}

Table.Head;
