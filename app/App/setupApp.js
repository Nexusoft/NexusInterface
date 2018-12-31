// External
import { remote } from 'electron';

// Internal
import MenuBuilder from 'menu';
import { GetSettings, SaveSettings } from 'api/settings';
import * as ac from 'actions/headerActionCreators';

export default function setupApp(dispatch) {
  const settings = GetSettings();
  if (Object.keys(settings).length < 1) {
    SaveSettings({ ...settings, keepDaemon: false });
    dispatch(ac.SwitchMessages(settings.locale));
  } else {
    dispatch(ac.SwitchMessages(settings.locale));
    dispatch(ac.setSettings(settings));
  }

  dispatch(ac.LoadAddressBook());

  dispatch(ac.GetInfoDump());
  setInterval(function() {
    dispatch(ac.AddRPCCall('getInfo'));
    dispatch(ac.GetInfoDump());
  }, 20000);

  dispatch(ac.SetMarketAveData());
  setInterval(function() {
    dispatch(ac.SetMarketAveData());
  }, 900000);

  const mainWindow = remote.getCurrentWindow();
  mainWindow.on('close', e => {
    e.preventDefault();
    store.dispatch(ac.clearOverviewVariables());
    this.context.showNotification('Closing Nexus...');
  });
}
