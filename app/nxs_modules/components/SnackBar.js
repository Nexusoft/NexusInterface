// External
import styled from '@emotion/styled';
import { keyframes } from '@emotion/core';

// Internal
import { timing } from 'styles';
import { color } from 'utils';

const notifHeight = 40;
const notifMargin = 15;

const intro = keyframes`
  from {
    opacity: 0;
    transform: translateY(-${notifHeight + notifMargin}px)
  }
  to {
    opacity: 1;
    transform: translateY(0)
  }
`;

const outtro = keyframes`
  from { opacity: 1 }
  to { opacity: 0 }
`;

const SnackBar = styled.div(
  {
    position: 'absolute',
    top: 0,
    left: 0,
    fontSize: 15,
    height: notifHeight,
    display: 'flex',
    alignItems: 'center',
    paddingLeft: '1.5em',
    paddingRight: '1.5em',
    borderRadius: 2,
    boxShadow: '0 0 8px rgba(0,0,0,.7)',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transitionProperty: 'background-color, transform',
    transitionDuration: timing.normal,
    '&::after': {
      content: '"✕"',
      fontSize: 10,
      fontWeight: 'bold',
      position: 'absolute',
      top: 2,
      right: 5,
      opacity: 0,
      transition: `opacity ${timing.normal}`,
    },
    '&:hover': {
      '&::after': {
        opacity: 1,
      },
    },
  },

  ({ index }) => ({
    transform: `translateY(${index * (notifHeight + notifMargin)}px)`,
    animation: `${intro} ${timing.normal} ease-out`,
  }),

  ({ type, theme }) => {
    switch (type) {
      case 'info':
        return {
          background: theme.darkerGray,
          color: theme.light,
          '&:hover': {
            background: color.lighten(theme.darkerGray, 0.2),
          },
        };
      case 'success':
        return {
          background: color.darken(theme.primary, 0.3),
          color: theme.primaryContrast,
          '&:hover': {
            background: color.darken(theme.primary, 0.1),
          },
        };
      case 'error':
        return {
          background: color.darken(theme.error, 0.2),
          color: theme.errorContrast,
          '&:hover': {
            background: theme.error,
          },
        };
      case 'work':
        return {
          background: theme.darkerGray,
          border: `1px solid ${theme.light}`,
          color: theme.light,
          '&:hover': {
            background: color.lighten(theme.darkerGray, 0.2),
          },
        };
    }
  },

  ({ closing }) =>
    closing && {
      animation: `${outtro} ${timing.normal} ease-out`,
    }
);

export default SnackBar;
