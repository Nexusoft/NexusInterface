import styled from '@emotion/styled';
import { Table } from '@tanstack/react-table';
import { HTMLAttributes } from 'react';

const PaginationStyled = styled.div({
  zIndex: 1,
  display: 'flex',
  boxPack: 'justify',
  justifyContent: 'space-between',
  boxAlign: 'stretch',
  alignItems: 'stretch',
  flexWrap: 'wrap',
  marginTop: '0.5em',
  boxShadow: '0 0 15px 0 rgba(0, 0, 0, 0.1)',
  borderTop: '2px solid rgba(0, 0, 0, 0.1)',
  flex: 'auto 0',
});

const PaginationSection = styled.div<{
  center?: boolean;
}>(
  {
    flex: 1,
    textAlign: 'center',
  },
  ({ center }) =>
    center && {
      boxFlex: 1.5,
      flex: 1.5,
      textAlign: 'center',
      marginBottom: 0,
      display: 'flex',
      boxOrient: 'horizontal',
      boxDirection: 'normal',
      flexDirection: 'row',
      flexWrap: 'wrap',
      boxAlign: 'center',
      alignItems: 'center',
      justifyContent: 'space-around',
    }
);

const PaginationButton = styled.button(({ theme }) => ({
  appearance: 'none',
  display: 'block',
  width: '100%',
  height: '100%',
  border: 0,
  borderRadius: 3,
  padding: 6,
  fontSize: '1em',
  color: theme.foreground,
  background: 'rgba(255, 255, 255, 0.1)',
  transition: 'all 0.1s ease',
  cursor: 'pointer',
  outline: 'none',

  '&:disabled': {
    opacity: 0.5,
    background: 'rgba(0, 0, 0, 0.1)',
    cursor: 'default',
  },

  '&:not([disabled]):hover': {
    background: 'rgba(255, 255, 255, 0.2)',
    color: '#fff',
  },
}));

const PageInfo = styled.span({
  display: 'inline-block',
  margin: '3px 10px',
  whiteSpace: 'nowrap',
});

const PageSizeOptions = styled.span(({ theme }) => ({
  margin: '3px 10px',
  color: theme.background,
  background: 'rgba(0, 0, 0, 0.02)',
}));

const PaginationInput = styled.input<{
  pageJump?: boolean;
}>(
  ({ theme }) => ({
    border: '1px solid rgba(0, 0, 0, 0.1)',
    background: 'transparent',
    padding: '5px 7px',
    // font-size: inherit,
    color: theme.foreground,
    borderRadius: 3,
    fontWeight: 'normal',
    outline: 'none',
  }),
  ({ pageJump }) =>
    pageJump && {
      width: '3.5em',
      textAlign: 'center',
    }
);

const PaginationOption = styled.option(({ theme }) => ({
  background: theme.background,
  backgroundBlendMode: 'difference',
  filter: 'invert(1)',
  fontWeight: 'normal',
  outline: 'none',
}));

export default function Pagination<TData>({
  table,
  ...rest
}: HTMLAttributes<HTMLDivElement> & {
  table: Table<TData>;
}) {
  return (
    <PaginationStyled {...rest}>
      <PaginationSection>
        <PaginationButton
          onClick={table.previousPage}
          disabled={!table.getCanPreviousPage()}
        >
          {'<'} Previous
        </PaginationButton>
      </PaginationSection>
      <PaginationSection center>
        <PageInfo>
          Page
          <PaginationInput
            pageJump
            type="number"
            value={table.getState().pagination.pageIndex + 1}
            onChange={({ target: { value } }) => {
              const page = value ? Number(value) - 1 : 0;
              table.setPageIndex(page);
            }}
          />
          of {table.getPageCount()}
        </PageInfo>
        <PageSizeOptions>
          <PaginationInput
            as="select"
            aria-label="rows per page"
            value={table.getState().pagination.pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
            }}
          >
            {[10, 20, 30, 40, 50].map((pageSize) => (
              <PaginationOption key={pageSize} value={pageSize}>
                {pageSize} rows
              </PaginationOption>
            ))}
          </PaginationInput>
        </PageSizeOptions>
      </PaginationSection>
      <PaginationSection>
        <PaginationButton
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next {'>'}
        </PaginationButton>
      </PaginationSection>
    </PaginationStyled>
  );
}
