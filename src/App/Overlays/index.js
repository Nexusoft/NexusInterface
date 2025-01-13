import { useSelector } from 'react-redux';
import { useAtomValue } from 'jotai';

import { openModal } from 'lib/ui';
import { settingsAtom } from 'lib/settings';

import ClosingScreen from './ClosingScreen';
import LockScreen from './LockScreen';
import SelectLanguage from './SelectLanguage';
import LicenseAgreement from './LicenseAgreement';
import LiteModeNotice from './LiteModeNotice';
import PreReleaseWarningModal from './PreReleaseWarningModal';
import TestnetWarningModal from './TestnetWarningModal';
import Wallet from './Wallet';
import { preRelease } from 'consts/misc';

export default function Overlays({ children }) {
  const { locale, liteModeNoticeDisabled, acceptedAgreement } =
    useAtomValue(settingsAtom);
  const closing = useSelector((state) => state.ui.closing);
  const locked = useSelector((state) => state.ui.locked);

  if (closing) {
    return <ClosingScreen />;
  }

  if (locked) {
    return (
      <Wallet>
        <LockScreen />
      </Wallet>
    );
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

  if (LOCK_TESTNET) {
    openModal(TestnetWarningModal);
  }

  return <Wallet>{children}</Wallet>;
}
