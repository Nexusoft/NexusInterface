// External
import React from 'react';
import { Global, css } from '@emotion/core';

// Internal
import * as color from 'utils/color';
import { consts } from 'styles';
import fontStyles from './fonts';

const resetStyles = theme => ({
  '*, *::before, *::after': {
    boxSizing: 'border-box',
  },

  body: {
    color: theme.foreground,
    height: '100vh',
    margin: 0,
    fontFamily: '"Noto Sans", sans-serif',
    fontSize: 16,
    lineHeight: consts.lineHeight,
    overflow: 'hidden',
  },

  '#root': {
    height: '100%',
  },

  a: {
    outline: 'none',
    color: 'inherit',
    textDecoration: 'none',
  },

  'button, input, textarea, select, optgroup': {
    fontFamily: 'inherit',
    fontSize: '1em',
    lineHeight: 1.15,
  },

  p: {
    marginTop: '1em',
    marginBottom: '1em',
  },

  svg: {
    fill: 'currentColor',
    stroke: 'currentColor',
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
    background: 'transparent',
    zIndex: 1,
    '&:vertical': {
      width: 6,
    },
    '&:horizontal': {
      height: 6,
    },
    '&-thumb': {
      background: color.fade(theme.primary, 0.25),
      borderRadius: 2,
      '&:hover': {
        background: color.fade(theme.primary, 0.1),
      },
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
    color: ${theme.danger};
  }

  .mt1 {
    margin-top: 1em;
  }
  .mt2 {
    margin-top: 2em;
  }

  .space-left {
    margin-left: 0.4em;
  }
  .space-right {
    margin-right: 0.4em;
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
