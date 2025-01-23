import { atom, Atom } from 'jotai';
import { store, subscribe } from 'lib/store';
import {
  defaultSettings,
  settingKeys,
  Settings,
  PartialSettings,
  SettingsKey,
} from './defaultSettings';
import { readSettings, writeSettings } from './universal';

const initialUserSettings = readSettings();
const userSettingsAtom = atom(initialUserSettings);

export const settingsAtom = atom((get) => ({
  ...defaultSettings,
  ...get(userSettingsAtom),
}));

const timerId: NodeJS.Timeout | undefined = undefined;
subscribe(userSettingsAtom, (settings) => {
  clearTimeout(timerId);
  // Write to file asynchronously to batch multiple consecutive updates into one disk write
  setTimeout(() => {
    writeSettings(settings);
  }, 0);
});

type SettingAtoms = {
  [K in SettingsKey]: Atom<Settings[K]>;
};

export const settingAtoms = Object.fromEntries(
  settingKeys.map((key) => [
    key,
    atom(
      (get) => get(settingsAtom)?.[key],
      (get, set, value) => {
        const userSettings = get(userSettingsAtom);
        if (userSettings?.[key] === value) return;
        const updatedUserSettings = {
          ...userSettings,
          [key]: value,
        };
        set(userSettingsAtom, updatedUserSettings);
      }
    ),
  ])
) as unknown as SettingAtoms;

export function updateSettings(updates: PartialSettings) {
  const userSettings = store.get(userSettingsAtom);
  store.set(userSettingsAtom, {
    ...userSettings,
    ...updates,
  });
}

export type { Settings, SettingsKey as SettingKeys, PartialSettings };
