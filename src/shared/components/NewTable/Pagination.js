import styled from '@emotion/styled';
import { consts } from 'styles';

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
});

const PaginationSection = styled.div(
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

const PaginationInput = styled.input(
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

export default function Pagination() {
  return (
    <PaginationStyled>
      <PaginationSection>
        <PaginationButton>{'<'} Previous</PaginationButton>
      </PaginationSection>
      <PaginationSection center>
        <PageInfo>
          Page
          <PaginationInput />
          of 10
        </PageInfo>
        <PageSizeOptions>
          <PaginationInput as="select" aria-label="rows per page">
            <option value="5">5 rows</option>
            <option value="10">10 rows</option>
            <option value="20">20 rows</option>
            <option value="25">25 rows</option>
            <option value="50">50 rows</option>
            <option value="100">100 rows</option>
          </PaginationInput>
        </PageSizeOptions>
      </PaginationSection>
      <PaginationSection>
        <PaginationButton>Next {'>'}</PaginationButton>
      </PaginationSection>
    </PaginationStyled>
  );
}
