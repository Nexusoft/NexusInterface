import * as TYPE from 'consts/actionTypes';
import store from 'store';
import path from 'path';
import { walletDataDir, fileExists } from 'consts/paths';
import { readJson, writeJson } from 'utils/json';

const themeFileName = 'theme.json';
const themeFilePath = path.join(walletDataDir, themeFileName);

const defaultTheme = {
  defaultStyle: 'Dark',
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

function filterValidTheme(theme) {
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

function readTheme() {
  if (fileExists(themeFilePath)) {
    return filterValidTheme(readJson(themeFilePath));
  } else {
    return defaultTheme;
  }
}

function writeTheme(theme) {
  return writeJson(themeFilePath, filterValidTheme(theme));
}

function loadThemeFromFile() {
  const customTheme = readTheme();
  return { ...defaultTheme, ...customTheme };
}

function updateThemeFile(updates) {
  const theme = readTheme();
  return writeTheme({ ...theme, ...updates });
}

export const loadTheme = loadThemeFromFile;

export const updateTheme = updates => {
  store.dispatch({ type: TYPE.UPDATE_THEME, payload: updates });
  updateThemeFile(updates);
};

export const resetColors = () => {
  const theme = readTheme();
  const newTheme = {};
  if (theme.wallpaper) newTheme.wallpaper = theme.wallpaper;
  store.dispatch({ type: TYPE.SET_THEME, payload: newTheme });
  return writeTheme(newTheme);
};
