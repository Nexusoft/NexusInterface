import UT from 'lib/usageTracking';
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
      UT.EnableAnalytics();
    }
    if (sendUsageData && !updates.sendUsageData) {
      UT.DisableAnalytics();
    }
  }
};
