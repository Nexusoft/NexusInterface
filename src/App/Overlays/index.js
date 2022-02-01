import { useSelector } from 'react-redux';

import { openModal } from 'lib/ui';

import ClosingScreen from './ClosingScreen';
import SelectLanguage from './SelectLanguage';
import LicenseAgreement from './LicenseAgreement';
import LiteModeNotice from './LiteModeNotice';
import PreReleaseWarningModal from './PreReleaseWarningModal';
import TestnetWarningModal from './TestnetWarningModal';
import Wallet from './Wallet';
import { preRelease } from 'consts/misc';

export default function Overlays({ children }) {
  const locale = useSelector((state) => state.settings.locale);
  const liteModeNoticeDisabled = useSelector(
    (state) => state.settings.liteModeNoticeDisabled
  );
  const acceptedAgreement = useSelector(
    (state) => state.settings.acceptedAgreement
  );
  const closing = useSelector((state) => state.ui.closing);

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

  if (preRelease) {
    openModal(PreReleaseWarningModal);
  }

  if (TESTNET_BUILD) {
    openModal(TestnetWarningModal);
  }

  return <Wallet>{children}</Wallet>;
}
