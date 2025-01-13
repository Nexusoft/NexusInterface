/**
 * Settings functionalities that can be used by both
 * renderer process and main process code
 */

import { settingsFilePath } from 'consts/paths';
import { readJson, writeJson } from 'utils/json';
import defaultSettings from './defaultSettings';

export function readSettings() {
  const userSettings = readJson(settingsFilePath);
  // Enable lite mode for new users while keeping false as default for existing users
  if (!userSettings) {
    return {
      liteMode: true,
      liteModeNoticeDisabled: true,
    };
  }
  return userSettings;
}

export function writeSettings(settings) {
  return writeJson(settingsFilePath, settings);
}

export function loadSettingsFromFile() {
  const userSettings = readSettings();
  return { ...defaultSettings, ...userSettings };
}

export function updateSettingsFile(updates) {
  const settings = readSettings() || {};
  return writeSettings({ ...settings, ...updates });
}
