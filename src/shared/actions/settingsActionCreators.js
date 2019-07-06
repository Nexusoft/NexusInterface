import ga from 'scripts/googleanalytics';
import { LoadSettings, UpdateSettings } from 'lib/settings';
import * as TYPE from './actiontypes';

export const loadSettingsFromFile = () => dispatch => {
  const settings = LoadSettings();
  dispatch({ type: TYPE.UPDATE_SETTINGS, payload: settings });
};

export const updateSettings = updates => (dispatch, getState) => {
  const oldState = getState();
  dispatch({ type: TYPE.UPDATE_SETTINGS, payload: updates });
  UpdateSettings(updates);

  if (updates.sendUsageData !== undefined) {
    const {
      settings: { sendUsageData },
    } = oldState;
    if (!sendUsageData && updates.sendUsageData) {
      ga.EnableAnalytics();
      ga.SendEvent('Settings', 'Analytics', 'Enabled', 1);
    }
    if (sendUsageData && !updates.sendUsageData) {
      ga.DisableAnalytics();
      ga.SendEvent('Settings', 'Analytics', 'Disabled', 1);
    }
  }
};
