import ga from 'scripts/googleanalytics';
import { GetSettings, SaveSettings } from 'api/settings';
import * as TYPE from './actiontypes';

export const updateSettings = updates => (dispatch, getState) => {
  if (updates.googleAnalytics !== undefined) {
    const {
      settings: {
        settings: { googleAnalytics },
      },
    } = getState();
    if (!googleAnalytics && updates.googleAnalytics) {
      ga.EnableAnalytics();
      ga.SendEvent('Settings', 'Analytics', 'Enabled', 1);
    }
    if (googleAnalytics && !updates.googleAnalytics) {
      ga.DisableAnalytics();
      ga.SendEvent('Settings', 'Analytics', 'Disabled', 1);
    }
  }

  dispatch({ type: TYPE.UPDATE_SETTINGS, payload: updates });
  const settings = GetSettings();
  SaveSettings({ ...settings, ...updates });
};
