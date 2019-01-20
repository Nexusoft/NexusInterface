import ga from 'scripts/googleanalytics';
import { LoadSettings, UpdateSettings } from 'api/settings';
import * as TYPE from './actiontypes';

export const loadSettingsFromFile = () => dispatch => {
  const settings = LoadSettings();
  dispatch({ type: TYPE.UPDATE_SETTINGS, payload: settings });
};

export const updateSettings = updates => (dispatch, getState) => {
  if (updates.sendUsageData !== undefined) {
    const {
      settings: { sendUsageData },
    } = getState();
    if (!sendUsageData && updates.sendUsageData) {
      ga.EnableAnalytics();
      ga.SendEvent('Settings', 'Analytics', 'Enabled', 1);
    }
    if (sendUsageData && !updates.sendUsageData) {
      ga.DisableAnalytics();
      ga.SendEvent('Settings', 'Analytics', 'Disabled', 1);
    }
  }

  dispatch({ type: TYPE.UPDATE_SETTINGS, payload: updates });
  UpdateSettings(updates);
};
