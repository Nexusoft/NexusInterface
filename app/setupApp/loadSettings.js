import { GetSettings, SaveSettings } from 'api/settings';
import UIController from 'components/UIController';
import * as ac from 'actions/setupAppActionCreators';
import LicenseAgreementModal from './LicenseAgreementModal';
import ExperimentalWarningModal from './ExperimentalWarningModal';

export default function loadSettings({ dispatch }) {
  const settings = GetSettings();
  dispatch(ac.loadSettings(settings));

  if (settings.acceptedagreement && settings.experimentalWarning == true)
  {
    UIController.openModal(ExperimentalWarningModal);
  }

  const showExperimentalWarning = () => {
    dispatch(ac.SetAcceptLicense());
    settings.acceptedagreement = true;
    SaveSettings(settings);
    if (settings.experimentalWarning == undefined || settings.experimentalWarning == true) {
      UIController.openModal(ExperimentalWarningModal);
    }
  };

  if (!settings.acceptedagreement) {
    UIController.openModal(LicenseAgreementModal, {
      fullScreen: true,
      onClose: showExperimentalWarning,
    });
  }
}
