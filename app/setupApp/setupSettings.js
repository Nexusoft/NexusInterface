import { GetSettings, SaveSettings } from 'api/settings';
import * as ac from 'actions/headerActionCreators';
import LicenseAgreementModal from './LicenseAgreementModal';

export default function setupSettings(dispatch) {
  const settings = GetSettings();
  if (Object.keys(settings).length < 1) {
    SaveSettings({ ...settings, keepDaemon: false });
  } else {
    dispatch(ac.setSettings(settings));
  }

  if (!settings.acceptedagreement) {
    UIController.openModal(LicenseAgreementModal);
  }
}
