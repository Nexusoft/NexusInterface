import * as TYPE from 'consts/actionTypes';
import store from 'store';
import path from 'path';
import fs from 'fs';
import { walletDataDir } from 'consts/paths';
import { readJson, writeJson } from 'utils/json';

const themeFileName = 'theme.json';
const themeFilePath = path.join(walletDataDir, themeFileName);

export const darkTheme = {
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

export const lightTheme = {
  defaultStyle: 'Light',
  background: '#91a0b8',
  danger: '#8F240E',
  dangerAccent: '#ffffff',
  foreground: '#fdfafa',
  globeArchColor: '#00ffff',
  globeColor: '#8fbcfe',
  globePillarColor: '#00ffff',
  primary: '#FFFFFF',
  primaryAccent: '#91a0b8',
};

export const potTheme = {
  defaultStyle: 'Dark',
  wallpaper: null,
  background: '#0a4224',
  foreground: '#D1E0DC',
  primary: '#1CBB38',
  primaryAccent: '#ffffff',
  danger: '#d75239',
  dangerAccent: '#ffffff',
  globeColor: '#0c7d3d',
  globePillarColor: '#00ffff',
  globeArchColor: '#00ffff',
  featuredTokenName: 'POT',
};

function readTheme() {
  if (fs.existsSync(themeFilePath)) {
    const json = readJson(themeFilePath) || {};
    return json;
  } else {
    return darkTheme;
  }
}

function writeTheme(theme) {
  return writeJson(themeFilePath, theme);
}

function loadThemeFromFile() {
  const customTheme = readTheme();
  return { ...darkTheme, ...customTheme };
}

function updateThemeFile(updates) {
  const theme = readTheme();
  return writeTheme({ ...theme, ...updates });
}

export const loadTheme = loadThemeFromFile;

export const updateTheme = (updates) => {
  store.dispatch({ type: TYPE.UPDATE_THEME, payload: updates });
  updateThemeFile(updates);
};

export const setTheme = (theme) => {
  store.dispatch({ type: TYPE.SET_THEME, payload: theme });
  writeTheme(theme);
};

export const resetColors = () => {
  const theme = readTheme();
  const newTheme = {};
  if (theme.wallpaper) newTheme.wallpaper = theme.wallpaper;
  store.dispatch({ type: TYPE.SET_THEME, payload: newTheme });
  return writeTheme(newTheme);
};
