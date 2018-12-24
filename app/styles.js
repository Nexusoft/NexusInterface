import { css, keyframes } from '@emotion/core';
import { darken, mix } from 'utils/colors';

export const colors = {};
colors.primary = '#00b7fa';
colors.dark = '#0f1b1f';
colors.light = '#e6e9eb';
colors.darkerGray = mix(colors.dark, colors.light, 0.125);
colors.darkGray = mix(colors.dark, colors.light, 0.25);
colors.gray = mix(colors.dark, colors.light);
colors.lightGray = mix(colors.dark, colors.light, 0.75);
colors.lighterGray = mix(colors.dark, colors.light, 0.875);
colors.primaryContrast = '#fff';

export const consts = {
  monoFontFamily: '"Roboto Mono", "Lucida Console", "Courier New", monospace',
  enhancedEaseOut: 'cubic-bezier(0, .9, .9, 1)',
  inputHeightEm: 2.25,
  lineHeight: 1.625,
};

export const timing = {
  quick: '.15s',
  normal: '.3s',
  slow: '2s',
};

export const animations = {
  expand: keyframes`
    from { transform: scale(0, 1) }
    to { transform: scale(1, 1) }
  `,
  fadeIn: keyframes`
    from { opacity: 0 }
    to { opacity: 1 }
  `,
  fadeInAndExpand: keyframes`
    from { 
      transform: scale(0.5);
      opacity: 0 
    }
    to { 
      transform: scale(1);
      opacity: 1
    }
  `,
  spin: keyframes`
    100% {
      transform: rotate(360deg);
    }
  `,
};
