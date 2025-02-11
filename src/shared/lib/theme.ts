import https from 'https';
import fs from 'fs';
import { atom } from 'jotai';

import { store, subscribe } from 'lib/store';
import path from 'path';
import { walletDataDir } from 'consts/paths';
import { readJson, writeJson } from 'utils/json';

const themeFileName = 'theme.json';
const themeFilePath = path.join(walletDataDir, themeFileName);

export interface Theme {
  wallpaper: string;
  background: string;
  foreground: string;
  primary: string;
  primaryAccent: string;
  danger: string;
  dangerAccent: string;
  globeColor: string;
  globePillarColor: string;
  globeArchColor: string;
}

export type PartialTheme = Partial<Theme>;

export const starryNightBackground = ':starry_night';
export const cosmicLightBackground = ':cosmic_light';
export const nexusThemeBackground = ':nexus_theme';

export const darkTheme: Theme = {
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

export const lightTheme: Theme = {
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

export const nexusTheme: Theme = {
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

const defaultTheme = darkTheme;

function readTheme() {
  if (fs.existsSync(themeFilePath)) {
    const json = (readJson(themeFilePath) || {}) as PartialTheme;
    return json;
  } else {
    return {} as PartialTheme;
  }
}

function writeTheme(theme: PartialTheme) {
  return writeJson(themeFilePath, theme);
}

const initialUserTheme = readTheme();
const userThemeAtom = atom<PartialTheme>(initialUserTheme);

export const themeAtom = atom<Theme>((get) => ({
  ...defaultTheme,
  ...get(userThemeAtom),
}));

const timerId: NodeJS.Timeout | undefined = undefined;
subscribe(userThemeAtom, (theme) => {
  clearTimeout(timerId);
  // Write to file asynchronously to batch multiple consecutive updates into one disk write
  setTimeout(() => {
    writeTheme(theme);
  }, 0);
});

const downloadWallpaper = (wallpaper: string) =>
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
      .get(wallpaper)
      .setTimeout(10000)
      .on('response', (response) => {
        response.pipe(file);
      })
      .on('error', reject)
      .on('timeout', () => {
        reject(new Error('Timeout'));
      });
  });

export const updateTheme = (updates: PartialTheme) => {
  store.set(userThemeAtom, (userTheme) => ({ ...userTheme, ...updates }));
};

export const setTheme = (theme: PartialTheme) => {
  store.set(userThemeAtom, theme);
};

export async function loadCustomTheme(path: string) {
  const theme = readJson(path);
  if (!theme) {
    throw new Error('Fail to read json file at ' + path);
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
