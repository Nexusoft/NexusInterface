import React from 'react';
import { connect } from 'react-redux';

import { legacyMode } from 'consts/misc';

import ClosingScreen from './ClosingScreen';
import SelectLanguage from './SelectLanguage';
import LicenseAgreement from './LicenseAgreement';
import ExperimentalWarning from './ExperimentalWarning';
import TritiumModeNotice from './TritiumModeNotice';
import Wallet from './Wallet';

const mapStateToProps = ({
  settings: {
    experimentalWarningDisabled,
    tritiumModeNoticeDisabled,
    acceptedAgreement,
    locale,
  },
  ui: { closing },
}) => ({
  locale,
  experimentalWarningDisabled,
  tritiumModeNoticeDisabled,
  acceptedAgreement,
  closing,
});

const Overlays = ({
  locale,
  experimentalWarningDisabled,
  tritiumModeNoticeDisabled,
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

  if (!legacyMode && !tritiumModeNoticeDisabled) {
    return <TritiumModeNotice />;
  }

  return <Wallet>{children}</Wallet>;
};

export default connect(mapStateToProps)(Overlays);
