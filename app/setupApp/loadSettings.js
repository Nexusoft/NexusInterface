import { GetSettings } from 'api/settings';
import UIController from 'components/UIController';
import * as ac from 'actions/setupAppActionCreators';
import LicenseAgreementModal from './LicenseAgreementModal';
import ExperimentalWarningModal from './ExperimentalWarningModal';

export default function loadSettings({ dispatch }) {
  const settings = GetSettings();
  dispatch(ac.setSettings(settings));

  const showExperimentalWarning = () => {
    if (settings.experimentalWarning) {
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
