import React from 'react';
import { connect } from 'react-redux';

import ClosingScreen from './ClosingScreen';
import SelectLanguage from './SelectLanguage';
import LicenseAgreement from './LicenseAgreement';
import ExperimentalWarning from './ExperimentalWarning';
import Wallet from './Wallet';

const mapStateToProps = ({
  settings: { experimentalWarningDisabled, acceptedAgreement, locale },
  ui: { closing },
}) => ({
  locale,
  experimentalWarningDisabled,
  acceptedAgreement,
  closing,
});

const Overlays = ({
  locale,
  experimentalWarningDisabled,
  acceptedAgreement,
  closing,
  children,
}) => {
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

  return <Wallet>{children}</Wallet>;
};

export default connect(mapStateToProps)(Overlays);
