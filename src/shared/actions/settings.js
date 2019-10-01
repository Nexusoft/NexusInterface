import GA from 'lib/googleAnalytics';
import { UpdateSettings, UpdateTempSettings } from 'lib/universal/settings';
import * as TYPE from 'consts/actionTypes';

export const updateSettings = updates => (dispatch, getState) => {
  const oldState = getState();
  dispatch({ type: TYPE.UPDATE_SETTINGS, payload: updates });
  UpdateSettings(updates);

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

export const updateTempSettings = updates => (dispatch, getState) => {
  const oldState = getState();
  const tempSettings = { ...oldState.settings.tempSettings, ...updates };
  dispatch({ type: TYPE.UPDATE_TEMP_SETTINGS, payload: tempSettings });
  UpdateTempSettings(tempSettings);
};
