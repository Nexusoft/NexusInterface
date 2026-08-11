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
import { ReactNode } from 'react';
import { ThemeProvider } from '@emotion/react';
import { darken, lighten, mix, luminosity } from 'utils/color';
import { Theme } from 'lib/theme';

export type Mixer = (ratio: number) => string;

export interface FortifiedTheme extends Theme {
  dark: boolean;
  mixer: Mixer;
  lower: (color: string, ratio: number) => string;
  raise: (color: string, ratio: number) => string;
}

// Mixer is a utility function that mixes the background and foreground color in a specified ratio
// to produce an intermediate color (may be thought of similarly to shades of gray between black and white)
function getMixer(background: string, foreground: string): Mixer {
  return (() => {
    // Memoize the mixed colors by ratios
    const mixes: Record<number, string> = {};
    return function mixer(ratio: number) {
      if (mixes[ratio]) {
        return mixes[ratio];
      } else {
        return (mixes[ratio] = mix(background, foreground, ratio));
      }
    };
  })();
}

function fortifyTheme(theme: Theme): FortifiedTheme {
  const dark = luminosity(theme.foreground) > luminosity(theme.background);
  return {
    ...theme,
    dark,
    mixer: getMixer(theme.background, theme.foreground),
    lower: dark ? darken : lighten,
    raise: dark ? lighten : darken,
  };
}

export default function ThemeController({
  theme,
  children,
}: {
  theme: Theme;
  children: ReactNode;
}) {
  return <ThemeProvider theme={fortifyTheme(theme)}>{children}</ThemeProvider>;
}
