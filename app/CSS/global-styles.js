import React from 'react';
import { Global, css } from '@emotion/core';
import { fade } from 'utils/colors';
import { colors } from 'styles';

const styles = css`
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

export default <Global styles={styles} />;
