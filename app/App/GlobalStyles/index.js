// External
import React from 'react';
import { Global, css } from '@emotion/core';
import { withTheme } from 'emotion-theming';

// Internal
import { color } from 'utils';
import { consts } from 'styles';
import fontStyles from './fonts';

const resetStyles = theme => ({
  '*, *::before, *::after': {
    boxSizing: 'border-box',
  },

  body: {
    color: theme.light,
    height: '100vh',
    backgroundColor: '#232c39',
    fontFamily: '"Noto Sans", sans-serif',
    fontSize: 16,
    lineHeight: consts.lineHeight,
    overflow: 'hidden',
  },

  a: {
    outline: 'none',
  },

  p: {
    marginTop: '1em',
    marginBottom: '1em',
  },

  svg: {
    fill: 'currentColor',
  },

  li: {
    listStyle: 'none',
  },

  canvas: {
    overflow: 'hidden',
  },

  code: {
    fontFamily: consts.monoFontFamily,
  },

  'input, textarea': {
    border: 'none',
    outline: 'none',
    '&:focus': {
      outline: 'none',
    },
  },
  'input::-webkit-inner-spin-button:': {
    cursor: 'pointer',
  },
});

const customizedScrollbar = theme => ({
  '::-webkit-scrollbar': {
    background: 'rgba(0, 0, 0, 0.15)',
    zIndex: 10000000,
    '&:vertical': {
      width: 6,
    },
    '&:horizontal': {
      height: 6,
    },
    '&:hover': {
      background: 'rgba(0, 0, 0, 0.3)',
    },
    '&-thumb': {
      background: color.fade(theme.primary, 0.25),
      borderRadius: 2,
    },
    '&-thumb:hover': {
      background: color.fade(theme.primary, 0.1),
    },
    '&-corner': {
      background: 'rgba(0, 0, 0, 0.5)',
    },
  },
});

const utilityClasses = theme => css`
  .relative {
    position: relative;
  }

  .v-align {
    vertical-align: middle;
  }

  .dim {
    opacity: 0.5;
  }

  .flex {
    display: flex;
    &.center {
      align-items: center;
    }
    &.stretch {
      align-items: stretch;
    }
    &.space-between {
      justify-content: space-between;
    }
  }

  .error {
    color: ${theme.error};
  }
`;

const GlobalStyles = () => (
  <>
    <Global styles={fontStyles} />
    <Global styles={resetStyles} />
    <Global styles={customizedScrollbar} />
    <Global styles={utilityClasses} />
  </>
);

export default GlobalStyles;
