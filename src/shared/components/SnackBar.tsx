// External
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

// Internal
import { timing } from 'styles';

export type SnackBarType = 'info' | 'success' | 'error' | 'work';

const notifHeight = 40;
const notifMargin = 15;

const intro = (index: number) => keyframes`
  from {
    opacity: 0;
    transform: translateY(-${(index - 1) * (notifHeight + notifMargin)}px)
  }
  to {
    opacity: 1;
    transform: translateY(${index * (notifHeight + notifMargin)})
  }
`;

const SnackBar = styled.div<{
  index: number;
  type: SnackBarType;
}>(
  {
    position: 'absolute',
    top: 0,
    left: 0,
    fontSize: 15,
    height: notifHeight,
    display: 'flex',
    alignItems: 'center',
    padding: '0 1.5em',
    borderRadius: 2,
    boxShadow: '0 0 8px rgba(0,0,0,.7)',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transitionProperty: 'background-color, transform',
    transitionDuration: timing.normal,
  },

  ({ index }) => ({
    transform: `translateY(${index * (notifHeight + notifMargin)}px)`,
    animation: `${intro(index)} ${timing.quick} ease-out`,
    animationFillMode: 'both',
  }),

  ({ type, theme }) => {
    switch (type) {
      case 'info':
        return {
          background: theme.mixer(0.125),
          color: theme.foreground,
          '&:hover': {
            background: theme.raise(theme.mixer(0.125), 0.2),
          },
        };
      case 'success':
        return {
          background: theme.lower(theme.primary, 0.3),
          color: theme.primaryAccent,
          '&:hover': {
            background: theme.lower(theme.primary, 0.1),
          },
        };
      case 'error':
        return {
          background: theme.lower(theme.danger, 0.2),
          color: theme.dangerAccent,
          '&:hover': {
            background: theme.danger,
          },
        };
      case 'work':
        return {
          background: theme.background,
          border: `1px solid ${theme.mixer(0.5)}`,
          color: theme.foreground,
          '&:hover': {
            background: theme.raise(theme.background, 0.2),
          },
        };
    }
  }
);

export default SnackBar;
