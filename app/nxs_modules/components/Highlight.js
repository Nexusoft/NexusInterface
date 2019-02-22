import styled from '@emotion/styled';

const Highlight = styled.span(({ theme }) => ({
  background: theme.mixer(0.25),
  color: theme.foreground,
}));

export default Highlight;
