import { atom, Atom } from 'jotai';
import { store, subscribeWithPrevious } from 'lib/store';
import {
  defaultSettings,
  settingKeys,
  Settings,
  PartialSettings,
  SettingsKey,
} from './defaultSettings';

const initialUserSettings = window.nexusElectron.settings.getInitial()
  .settings as PartialSettings;
const userSettingsAtom = atom(initialUserSettings);

export const settingsAtom = atom((get) => ({
  ...defaultSettings,
  ...get(userSettingsAtom),
}));

let timerId: ReturnType<typeof setTimeout> | undefined;
subscribeWithPrevious(userSettingsAtom, (settings, previousSettings) => {
  clearTimeout(timerId);
  timerId = setTimeout(() => {
    const updates = Object.fromEntries(
      Object.entries(settings).filter(
        ([key, value]) => previousSettings?.[key as SettingsKey] !== value
      )
    ) as PartialSettings;
    if (Object.keys(updates).length) {
      window.nexusElectron.settings.update(updates).catch(console.error);
    }
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
