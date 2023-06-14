import https from 'https';
import fs from 'fs';

import * as TYPE from 'consts/actionTypes';
import store from 'store';
import path from 'path';
import { walletDataDir } from 'consts/paths';
import { readJson, writeJson } from 'utils/json';

const themeFileName = 'theme.json';
const themeFilePath = path.join(walletDataDir, themeFileName);

export const starryNightBackground = ':starry_night';
export const cosmicLightBackground = ':cosmic_light';
export const nexusThemeBackground = ':nexus_theme';

export const darkTheme = {
  wallpaper: starryNightBackground,
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
  wallpaper: cosmicLightBackground,
  background: '#C6D1D2',
  danger: '#8F240E',
  dangerAccent: '#EEF0F1',
  foreground: '#565A5C',
  globeArchColor: '#00ffff',
  globeColor: '#58BCFE',
  globePillarColor: '#00ffff',
  primary: '#07C5E9',
  primaryAccent: '#404244',
};

export const nexusTheme = {
  wallpaper: nexusThemeBackground,
  background: '#025E93',
  danger: '#8F240E',
  dangerAccent: '#EEF0F1',
  foreground: '#E1F3FF',
  globeArchColor: '#E8FF00',
  globeColor: '#0CA4FB',
  globePillarColor: '#FF0047',
  primary: '#15AEF3',
  primaryAccent: '#E1EFF8',
};

// TODO: remove this after a few versions
function transformTheme(theme) {
  let changed = false;
  if (theme.defaultStyle) {
    changed = true;
    if (theme.defaultStyle?.startsWith('Light')) {
      theme.dark = false;
      if (!theme.wallpaper) {
        theme.wallpaper = cosmicLightBackground;
      }
    } else {
      theme.dark = true;
      if (!theme.wallpaper) {
        theme.wallpaper = starryNightBackground;
      }
    }
    delete theme.defaultStyle;
  }
  return changed;
}

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
  const changed = transformTheme(customTheme);
  if (changed) {
    writeTheme(customTheme);
  }
  return { ...darkTheme, ...customTheme };
}

function updateThemeFile(updates) {
  const theme = readTheme();
  return writeTheme({ ...theme, ...updates });
}

const downloadWallpaper = (wallpaper) =>
  new Promise((resolve, reject) => {
    const wallpaperPathSplit = wallpaper.split('.');
    const fileEnding = wallpaperPathSplit[wallpaperPathSplit.length - 1];
    const file = fs.createWriteStream(
      walletDataDir + '/wallpaper.' + fileEnding
    );
    file.on('finish', () => {
      file.close(() => {
        resolve(file.path);
      });
    });
    https
      .get(customTheme.wallpaper)
      .setTimeout(10000)
      .on('response', (response) => {
        response.pipe(file);
      })
      .on('error', reject)
      .on('timeout', () => {
        reject(new Error('Timeout'));
      });
  });

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

export async function loadCustomTheme(path) {
  const theme = readJson(path);
  if (!theme) {
    throw new Error('Fail to read json file at ' + path);
  }

  const changed = transformTheme(theme);
  if (changed) {
    writeJson(path, theme);
  }

  if (theme.wallpaper && theme.wallpaper.startsWith('http')) {
    try {
      theme.wallpaper = await downloadWallpaper(theme.wallpaper);
    } catch (err) {
      throw err;
    }
  }

  setTheme(theme);
}
