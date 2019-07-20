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

import Color from 'color';

export function negate(color) {
  return Color(color)
    .negate()
    .string();
}

export function lighten(color, value) {
  return Color(color)
    .lighten(value)
    .string();
}

export function darken(color, value) {
  return Color(color)
    .darken(value)
    .string();
}

export function saturate(color, value) {
  return Color(color)
    .saturate(value)
    .string();
}

export function desaturate(color, value) {
  return Color(color)
    .desaturate(value)
    .string();
}

export function grayscale(color) {
  return Color(color)
    .grayscale()
    .string();
}

export function whiten(color, value) {
  return Color(color)
    .whiten(value)
    .string();
}

export function blacken(color, value) {
  return Color(color)
    .blacken(value)
    .string();
}

export function fade(color, value) {
  return Color(color)
    .fade(value)
    .string();
}

export function opaquer(color, value) {
  return Color(color)
    .opaquer(value)
    .string();
}

export function rotate(color, value) {
  return Color(color)
    .rotate(value)
    .string();
}

export function mix(color1, color2, value) {
  return Color(color1)
    .mix(Color(color2), value)
    .string();
}

export function isLight(color) {
  return Color(color).isLight();
}

export function isDark(color) {
  return Color(color).isDark();
}

export function toHex(color) {
  return Color(color).hex();
}

// Mixer is a utility function that mixes the background and foreground color in a specified ratio
// to produce an intermediate color (may be thought of similarly to shades of gray between black and white)
export const getMixer = (() => {
  let currBackground = null;
  let currForeground = null;
  // Memoize the mixer if the background and foreground colors are not changed
  let mixer = () => {};

  return function getMixer(background, foreground) {
    if (background !== currBackground || foreground !== currForeground) {
      currBackground = background;
      currForeground = foreground;

      mixer = (() => {
        // Memoize the mixed colors by ratios
        const mixes = {};
        return function mixer(ratio) {
          if (mixes[ratio]) {
            return mixes[ratio];
          } else {
            return (mixes[ratio] = mix(background, foreground, ratio));
          }
        };
      })();
    }

    return mixer;
  };
})();
