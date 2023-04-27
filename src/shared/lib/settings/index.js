import GA from 'lib/googleAnalytics';
import * as TYPE from 'consts/actionTypes';
import store from 'store';
import { updateSettingsFile } from './universal';

export const updateSettings = (updates) => {
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
