import styled from '@emotion/styled';

export default styled.div<{ maxWidth?: number }>(
  ({ theme, maxWidth = 500 }) => ({
    maxWidth,
    margin: '0 auto',
    paddingTop: 15,
    color: theme.mixer(0.75),
  })
);
