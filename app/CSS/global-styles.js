// External
import React from 'react';
import { Global, css } from '@emotion/core';

// Internal
import { fade } from 'utils/colors';
import { colors, consts } from 'styles';
import fontStyles from './fonts';

const resetStyles = css`
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  body {
    color: ${colors.light};
    height: 100vh;
    background-color: #232c39;
    font-family: 'Noto Sans', sans-serif;
    font-size: 16px;
    overflow: hidden;
  }

  svg {
    fill: currentColor;
  }

  li {
    list-style: none;
  }

  canvas {
    overflow: hidden;
  }

  code {
    font-family: ${consts.monoFontFamily};
  }

  /* Customize Scrollbar */
  ::-webkit-scrollbar {
    width: 6px;
    background: rgba(0, 0, 0, 0.25);
    z-index: 10000000;
  }

  ::-webkit-scrollbar:hover {
    background: rgba(0, 0, 0, 0.5);
  }

  ::-webkit-scrollbar-thumb {
    background: ${fade(colors.primary, 0.25)};
    border-radius: 2px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${fade(colors.primary, 0.1)};
  }

  ::-webkit-scrollbar-corner {
    background: rgba(0, 0, 0, 0.5);
  }
`;

const utilityClasses = css`
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
  }

  .flex.center {
    align-items: center;
  }

  .flex.stretch {
    align-items: stretch;
  }
`;

export default <Global styles={[fontStyles, resetStyles, utilityClasses]} />;
