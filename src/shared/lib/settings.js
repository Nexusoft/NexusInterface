import GA from 'lib/googleAnalytics';
import {
  updateSettingsFile,
  updateTempSettings as updateTempSettingsRaw,
} from 'lib/universal/settings';
import * as TYPE from 'consts/actionTypes';
import store from 'store';

export const updateSettings = updates => {
  const oldState = store.getState();
  store.dispatch({ type: TYPE.UPDATE_SETTINGS, payload: updates });
  updateSettingsFile(updates);

  if (updates.sendUsageData !== undefined) {
    const {
      settings: { sendUsageData },
    } = oldState;
    if (!sendUsageData && updates.sendUsageData) {
      GA.EnableAnalytics();
      GA.SendEvent('Settings', 'Analytics', 'Enabled', 1);
    }
    if (sendUsageData && !updates.sendUsageData) {
      GA.DisableAnalytics();
      GA.SendEvent('Settings', 'Analytics', 'Disabled', 1);
    }
  }
};

export const updateTempSettings = updates => {
  const oldState = store.getState();
  const tempSettings = { ...oldState.settings.tempSettings, ...updates };
  store.dispatch({ type: TYPE.UPDATE_TEMP_SETTINGS, payload: tempSettings });
  updateTempSettingsRaw(tempSettings);
};
