import { connect } from 'react-redux';

import ClosingScreen from './ClosingScreen';
import SelectLanguage from './SelectLanguage';
import LicenseAgreement from './LicenseAgreement';
import LiteModeNotice from './LiteModeNotice';
import Wallet from './Wallet';

const mapStateToProps = ({
  settings: { liteModeNoticeDisabled, acceptedAgreement, locale },
  ui: { closing },
}) => ({
  locale,
  liteModeNoticeDisabled,
  acceptedAgreement,
  closing,
});

const Overlays = ({
  locale,
  liteModeNoticeDisabled,
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

  if (!liteModeNoticeDisabled) {
    return <LiteModeNotice />;
  }

  return <Wallet>{children}</Wallet>;
};

export default connect(mapStateToProps)(Overlays);
