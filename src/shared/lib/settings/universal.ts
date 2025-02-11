/**
 * Settings functionalities that can be used by both
 * renderer process and main process code
 */
import { settingsFilePath } from 'consts/paths';
import { readJson, writeJson } from 'utils/json';
import { defaultSettings, PartialSettings } from './defaultSettings';

export function readSettings() {
  // Enable lite mode for new users while keeping false as default for existing users
  const userSettings: PartialSettings = readJson(settingsFilePath) || {
    liteMode: true,
    liteModeNoticeDisabled: true,
  };
  return userSettings;
}

export function writeSettings(settings: PartialSettings) {
  return writeJson(settingsFilePath, settings);
}

export function loadSettingsFromFile() {
  const userSettings = readSettings();
  return { ...defaultSettings, ...userSettings };
}

export function updateSettingsFile(updates: PartialSettings) {
  const settings = readSettings() || {};
  return writeSettings({ ...settings, ...updates });
}
