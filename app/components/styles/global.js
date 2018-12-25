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
    line-height: ${consts.lineHeight};
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

  input,
  textarea {
    border: none;
    outline: none;
    &:focus {
      outline: none;
    }
  }
  input::-webkit-inner-spin-button: {
    cursor: pointer;
  }
`;

const customizedScrollbar = css`
  ::-webkit-scrollbar {
    background: rgba(0, 0, 0, 0.25);
    z-index: 10000000;
    &:vertical {
      width: 6px;
    }
    &:horizontal {
      height: 6px;
    }
    &:hover {
      background: rgba(0, 0, 0, 0.5);
    }
    &-thumb {
      background: ${fade(colors.primary, 0.25)};
      border-radius: 2px;
    }
    &-thumb:hover {
      background: ${fade(colors.primary, 0.1)};
    }
    &-corner {
      background: rgba(0, 0, 0, 0.5);
    }
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
    color: red;
  }
`;

export default (
  <Global
    styles={[fontStyles, resetStyles, customizedScrollbar, utilityClasses]}
  />
);
