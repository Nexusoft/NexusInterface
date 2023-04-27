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

import { ThemeProvider } from '@emotion/react';
import { darken, lighten, mix, luminosity } from 'utils/color';

// Mixer is a utility function that mixes the background and foreground color in a specified ratio
// to produce an intermediate color (may be thought of similarly to shades of gray between black and white)
const getMixer = (() => {
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

function fortifyTheme(theme) {
  const dark = luminosity(theme.foreground) > luminosity(theme.background);
  return {
    ...theme,
    dark,
    mixer: getMixer(theme.background, theme.foreground),
    lower: dark ? darken : lighten,
    raise: dark ? lighten : darken,
  };
}

export default function ThemeController({ theme, children }) {
  return <ThemeProvider theme={fortifyTheme(theme)}>{children}</ThemeProvider>;
}
