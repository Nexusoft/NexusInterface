import styled from '@emotion/styled';

import { timing } from 'styles';

export default styled.div(
  ({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: '.5em 30px',
    margin: '0 -30px',
    transitionProperty: 'background, color',
    transitionDuration: timing.normal,
    cursor: 'pointer',

    '&:hover': {
      background: theme.mixer(0.05),
    },

    '&.active, &.active:hover': {
      background: theme.primary,
      color: theme.primaryAccent,
    },
  }),
  ({ active, theme }) =>
    active && {
      '&, &:hover': {
        background: theme.primary,
        color: theme.primaryAccent,
      },
    }
);
