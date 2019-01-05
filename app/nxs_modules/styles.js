import { css, keyframes } from '@emotion/core';
import { color } from 'utils';

const defaultColors = {
  dark: '#1c1d1f',
  light: '#ebebe6',
  primary: '#00b7fa',
  primaryContrast: '#ffffff',
  error: '#8f240e',
  errorContrast: '#ffffff',
};

function deriveColors(colors) {
  return {
    ...colors,
    darkerGray: color.mix(colors.dark, colors.light, 0.125),
    darkGray: color.mix(colors.dark, colors.light, 0.25),
    gray: color.mix(colors.dark, colors.light),
    lightGray: color.mix(colors.dark, colors.light, 0.75),
    lighterGray: color.mix(colors.dark, colors.light, 0.875),
  };
}

export const colors = deriveColors({ ...defaultColors });
colors.default = defaultColors;
colors.derive = deriveColors;

export const consts = {
  monoFontFamily: '"Roboto Mono", "Lucida Console", "Courier New", monospace',
  enhancedEaseOut: 'cubic-bezier(0, .9, .9, 1)',
  inputHeightEm: 2.25,
  lineHeight: 1.625,
};

export const timing = {
  quick: '150ms',
  normal: '300ms',
  slow: '2000ms',
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
  fadeOut: keyframes`
    from { opacity: 1 }
    to { opacity: 0 }
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
