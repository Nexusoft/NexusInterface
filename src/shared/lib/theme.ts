import { atom } from 'jotai';

import { store, subscribeWithPrevious } from 'lib/store';

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
  wallpaperSize?: string;
  wallpaperBackgroundColor?: string;
  featuredTokenName?: string;
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

const initialUserTheme = window.nexusElectron.theme.getInitial() as PartialTheme;
const userThemeAtom = atom<PartialTheme>(initialUserTheme);

export const themeAtom = atom<Theme>((get) => ({
  ...defaultTheme,
  ...get(userThemeAtom),
}));

let timerId: ReturnType<typeof setTimeout> | undefined;
subscribeWithPrevious(userThemeAtom, (theme, previousTheme) => {
  clearTimeout(timerId);
  timerId = setTimeout(() => {
    const updates = Object.fromEntries(
      Object.entries(theme).filter(([key, value]) => previousTheme[key as keyof Theme] !== value)
    ) as PartialTheme;
    if (Object.keys(updates).length) {
      window.nexusElectron.theme.update(updates).catch(console.error);
    }
  }, 0);
});

export const updateTheme = (updates: PartialTheme) => {
  store.set(userThemeAtom, (userTheme) => ({ ...userTheme, ...updates }));
};

export const setTheme = (theme: PartialTheme) => {
  store.set(userThemeAtom, theme);
};

export async function loadCustomTheme() {
  const theme = await window.nexusElectron.theme.importFromDialog();
  if (!theme) return;
  setTheme(theme as PartialTheme);
}
