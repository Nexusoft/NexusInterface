/**
 * Important note - This file is imported into module_preload.js, either directly or
 * indirectly, and will be a part of the preload script for modules, therefore:
 * - Be picky with importing stuffs into this file, especially for big
 * files and libraries. The bigger the preload scripts get, the slower the modules
 * will load.
 * - Don't assign anything to `global` variable because it will be passed
 * into modules' execution environment.
 * - Make sure this note also presents in other files which are imported here.
 */

// External
import { Global, css } from '@emotion/react';

// Internal
import * as color from 'utils/color';
import { consts } from 'styles';
import fontStyles from './fonts';

const resetStyles = (theme) => ({
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
    userDrag: 'none',
  },

  'button, input, textarea, select, optgroup': {
    fontFamily: 'inherit',
    fontSize: '1em',
    lineHeight: 1.15,
  },

  img: {
    maxWidth: '100%',
    userDrag: 'none',
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
    padding: '0.1666em 0.3333em',
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

const customizedScrollbar = (theme) => ({
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

const utilityClasses = (theme) => css`
  .relative {
    position: relative;
  }

  .v-align {
    vertical-align: middle;
  }

  .text-center {
    text-align: center;
  }

  .dim {
    opacity: 0.5;
  }
  .semi-dim {
    opacity: 0.8;
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
    &.justify-start {
      justify-content: flex-start;
    }
    &.justify-end {
      justify-content: flex-end;
    }
  }
  .flex1 {
    flex: 1;
  }

  .error {
    color: ${theme.danger};
  }

  .mt0_4 {
    margin-top: 0.4em;
  }
  .mt1 {
    margin-top: 1em;
  }
  .mt2 {
    margin-top: 2em;
  }
  .mt3 {
    margin-top: 3em;
  }
  .ml0_4 {
    margin-left: 0.4em;
  }
  .ml1 {
    margin-left: 1em;
  }
  .ml2 {
    margin-left: 2em;
  }
  .ml3 {
    margin-left: 3em;
  }
  .mr0_4 {
    margin-right: 0.4em;
  }
  .mr1 {
    margin-right: 1em;
  }
  .mr2 {
    margin-right: 2em;
  }
  .mr3 {
    margin-right: 3em;
  }
  .mb0_4 {
    margin-bottom: 0.4em;
  }
  .mb1 {
    margin-bottom: 1em;
  }
  .mb2 {
    margin-bottom: 2em;
  }
  .mb3 {
    margin-bottom: 3em;
  }

  .monospace {
    font-family: ${consts.monoFontFamily};
  }

  .pointer {
    cursor: pointer;
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
