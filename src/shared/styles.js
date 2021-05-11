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

import { keyframes } from '@emotion/react';
import * as color from 'utils/color';

const defaultColors = {
  background: '#1c1d1f',
  foreground: '#ebebe6',
  primary: '#00b7fa',
  primaryAccent: '#ffffff',
  danger: '#8f240e',
  dangerAccent: '#ffffff',
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

export const zIndex = {
  overlays: 10,
  snackbars: 20,
  tooltips: 30,
};
