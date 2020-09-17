import React from 'react';
import { connect } from 'react-redux';

import { updateSettings } from 'lib/settings';

import ClosingScreen from './ClosingScreen';
import SelectLanguage from './SelectLanguage';
import LicenseAgreement from './LicenseAgreement';
import ExperimentalWarning from './ExperimentalWarning';
import LightModeNotice from './LightModeNotice';
import Wallet from './Wallet';

const mapStateToProps = ({
  settings: {
    experimentalWarningDisabled,
    lightModeNoticeDisabled,
    acceptedAgreement,
    locale,
    enableStaking,
  },
  ui: { closing },
}) => ({
  locale,
  experimentalWarningDisabled,
  lightModeNoticeDisabled,
  acceptedAgreement,
  closing,
  enableStaking,
});

const Overlays = ({
  locale,
  experimentalWarningDisabled,
  lightModeNoticeDisabled,
  acceptedAgreement,
  closing,
  enableStaking,
  children,
}) => {
  React.useEffect(() => {
    // Disable the notice even when the notice is not shown
    if (
      !closing &&
      locale &&
      acceptedAgreement &&
      experimentalWarningDisabled &&
      !lightModeNoticeDisabled &&
      enableStaking
    ) {
      updateSettings({ lightModeNoticeDisabled: true });
    }
  }, [
    closing,
    locale,
    acceptedAgreement,
    experimentalWarningDisabled,
    lightModeNoticeDisabled,
    enableStaking,
  ]);

  if (closing) {
    return <ClosingScreen />;
  }

  if (!locale) {
    return <SelectLanguage />;
  }

  if (!acceptedAgreement) {
    return <LicenseAgreement />;
  }

  if (!experimentalWarningDisabled) {
    return <ExperimentalWarning />;
  }

  if (!lightModeNoticeDisabled && !enableStaking) {
    return <LightModeNotice />;
  }

  return <Wallet>{children}</Wallet>;
};

export default connect(mapStateToProps)(Overlays);
