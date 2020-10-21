import React from 'react';
import { connect } from 'react-redux';

import { updateSettings } from 'lib/settings';

import ClosingScreen from './ClosingScreen';
import SelectLanguage from './SelectLanguage';
import LicenseAgreement from './LicenseAgreement';
import ExperimentalWarning from './ExperimentalWarning';
import LiteModeNotice from './LiteModeNotice';
import Wallet from './Wallet';

const mapStateToProps = ({
  settings: {
    experimentalWarningDisabled,
    liteModeNoticeDisabled,
    acceptedAgreement,
    locale,
    enableStaking,
  },
  ui: { closing },
}) => ({
  locale,
  experimentalWarningDisabled,
  liteModeNoticeDisabled,
  acceptedAgreement,
  closing,
  enableStaking,
});

const Overlays = ({
  locale,
  experimentalWarningDisabled,
  liteModeNoticeDisabled,
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
      !liteModeNoticeDisabled &&
      enableStaking
    ) {
      updateSettings({ liteModeNoticeDisabled: true });
    }
  }, [
    closing,
    locale,
    acceptedAgreement,
    experimentalWarningDisabled,
    liteModeNoticeDisabled,
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

  if (!liteModeNoticeDisabled && !enableStaking) {
    return <LiteModeNotice />;
  }

  return <Wallet>{children}</Wallet>;
};

export default connect(mapStateToProps)(Overlays);
