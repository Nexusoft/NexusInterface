import config from 'api/configuration';
import { color } from 'utils';

const themeFileName = 'theme.json';

export const defaultTheme = {
  defaultStyle: "Dark",
  wallpaper: null,
  background: '#1c1d1f',
  foreground: '#ebebe6',
  primary: '#00b7fa',
  primaryAccent: '#ffffff',
  danger: '#8f240e',
  dangerAccent: '#ffffff',
  globeColor: '#0097e4',
  globePillarColor: '#00ffff',
  globeArchColor: '#00ffff',
};

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
            return (mixes[ratio] = color.mix(background, foreground, ratio));
          }
        };
      })();
    }

    return mixer;
  };
})();

function readTheme() {
  return config.ReadJson(themeFileName);
}

function writeTheme(theme) {
  return config.WriteJson(themeFileName, filterValidTheme(theme));
}

export function filterValidTheme(theme) {
  const validTheme = {};
  Object.keys(theme || {}).map(key => {
    if (defaultTheme.hasOwnProperty(key)) {
      validTheme[key] = theme[key];
    } else {
      console.error(`Invalid theme propery \`${key}\``);
    }
  });
  return validTheme;
}

export function LoadTheme() {
  const customTheme = readTheme();
  return { ...defaultTheme, ...customTheme };
}

export function UpdateTheme(updates) {
  const theme = readTheme();
  return writeTheme({ ...theme, ...updates });
}

export function ResetColors() {
  const theme = readTheme();
  const newTheme = {};
  if (theme.wallpaper) newTheme.wallpaper = theme.wallpaper;
  return writeTheme(newTheme);
}
