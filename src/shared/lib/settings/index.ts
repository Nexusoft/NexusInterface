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
let persistedSettings = initialUserSettings;
let queuedSettings = initialUserSettings;
const settingVersions: Partial<Record<SettingsKey, number>> = {};
let persistenceQueue = Promise.resolve();
let pendingPersistenceWaiters: Array<{
  resolve: () => void;
  reject: (error: unknown) => void;
}> = [];
subscribeWithPrevious(userSettingsAtom, () => {
  clearTimeout(timerId);
  timerId = setTimeout(() => {
    const waiters = pendingPersistenceWaiters;
    pendingPersistenceWaiters = [];
    const targetSettings = store.get(userSettingsAtom);
    const targetVersions = { ...settingVersions };
    const batchUpdates = Object.fromEntries(
      Object.entries(targetSettings).filter(
        ([key, value]) => queuedSettings?.[key as SettingsKey] !== value
      )
    ) as PartialSettings;
    queuedSettings = targetSettings;
    if (!Object.keys(batchUpdates).length) {
      const targetAlreadyPersisted = Object.entries(targetSettings).every(
        ([key, value]) => persistedSettings?.[key as SettingsKey] === value
      );
      if (targetAlreadyPersisted) {
        waiters.forEach(({ resolve }) => resolve());
        return;
      }
      persistenceQueue.then(
        () => waiters.forEach(({ resolve }) => resolve()),
        (error) => waiters.forEach(({ reject }) => reject(error))
      );
      return;
    }
    persistenceQueue = persistenceQueue
      .catch(() => {})
      .then(async () => {
        const updates = Object.fromEntries(
          Object.entries(batchUpdates).filter(
            ([key, value]) =>
              persistedSettings?.[key as SettingsKey] !== value
          )
        ) as PartialSettings;
        if (Object.keys(updates).length) {
          await window.nexusElectron.settings.update(updates);
          persistedSettings = { ...persistedSettings, ...updates };
        }
      })
      .catch((error) => {
        const currentSettings = store.get(userSettingsAtom);
        const rolledBackSettings = { ...currentSettings };
        const reconciledQueuedSettings = { ...queuedSettings };
        let changed = false;
        Object.entries(batchUpdates).forEach(([key, value]) => {
          const settingsKey = key as SettingsKey;
          if (
            settingVersions[settingsKey] !== targetVersions[settingsKey] ||
            persistedSettings[settingsKey] === value ||
            currentSettings[settingsKey] !== value
          ) {
            return;
          }
          if (Object.prototype.hasOwnProperty.call(persistedSettings, key)) {
            rolledBackSettings[settingsKey] = persistedSettings[settingsKey];
          } else {
            delete rolledBackSettings[settingsKey];
          }
          changed = true;
          if (queuedSettings[settingsKey] === value) {
            if (Object.prototype.hasOwnProperty.call(persistedSettings, key)) {
              reconciledQueuedSettings[settingsKey] =
                persistedSettings[settingsKey];
            } else {
              delete reconciledQueuedSettings[settingsKey];
            }
          }
        });
        queuedSettings = reconciledQueuedSettings;
        if (changed) store.set(userSettingsAtom, rolledBackSettings);
        console.error(error);
        throw error;
      });
    persistenceQueue.then(
      () => waiters.forEach(({ resolve }) => resolve()),
      (error) => waiters.forEach(({ reject }) => reject(error))
    );
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
        settingVersions[key] = (settingVersions[key] || 0) + 1;
        set(userSettingsAtom, updatedUserSettings);
      }
    ),
  ])
) as unknown as SettingAtoms;

export function updateSettings(updates: PartialSettings) {
  const persisted = new Promise<void>((resolve, reject) => {
    pendingPersistenceWaiters.push({ resolve, reject });
  });
  persisted.catch(() => {});
  const userSettings = store.get(userSettingsAtom);
  Object.entries(updates).forEach(([key, value]) => {
    const settingsKey = key as SettingsKey;
    if (userSettings[settingsKey] !== value) {
      settingVersions[settingsKey] = (settingVersions[settingsKey] || 0) + 1;
    }
  });
  store.set(userSettingsAtom, {
    ...userSettings,
    ...updates,
  });
  return persisted;
}

export type { Settings, SettingsKey as SettingKeys, PartialSettings };
