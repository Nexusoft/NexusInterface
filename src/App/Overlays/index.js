import React from 'react';
import { connect } from 'react-redux';

import { updateSettings } from 'lib/settings';

import ClosingScreen from './ClosingScreen';
import SelectLanguage from './SelectLanguage';
import LicenseAgreement from './LicenseAgreement';
import ExperimentalWarning from './ExperimentalWarning';
import ClientModeNotice from './ClientModeNotice';
import Wallet from './Wallet';

const mapStateToProps = ({
  settings: {
    experimentalWarningDisabled,
    clientModeNoticeDisabled,
    acceptedAgreement,
    locale,
    enableStaking,
  },
  ui: { closing },
}) => ({
  locale,
  experimentalWarningDisabled,
  clientModeNoticeDisabled,
  acceptedAgreement,
  closing,
  enableStaking,
});

const Overlays = ({
  locale,
  experimentalWarningDisabled,
  clientModeNoticeDisabled,
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
      !clientModeNoticeDisabled &&
      enableStaking
    ) {
      updateSettings({ clientModeNoticeDisabled: true });
    }
  }, [
    closing,
    locale,
    acceptedAgreement,
    experimentalWarningDisabled,
    clientModeNoticeDisabled,
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

  if (!clientModeNoticeDisabled && !enableStaking) {
    return <ClientModeNotice />;
  }

  return <Wallet>{children}</Wallet>;
};

export default connect(mapStateToProps)(Overlays);
