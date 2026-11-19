import { useAtomValue } from 'jotai';
import { ReactNode, useState } from 'react';

import { settingsAtom, updateSettings } from 'lib/settings';
import { walletClosingAtom, walletLockedAtom } from 'lib/wallet';
import { coreConnectedAtom } from 'lib/coreInfo';

import ClosingScreen from './ClosingScreen';
import LockScreen from './LockScreen';
import SelectLanguage from './SelectLanguage';
import LicenseAgreement from './LicenseAgreement';
import LiteModeNotice from './LiteModeNotice';
import PreReleaseWarningModal from './PreReleaseWarningModal';
import TestnetWarningModal from './TestnetWarningModal';
import Wallet from './Wallet';
import { preRelease } from 'consts/misc';

export default function Overlays({ children }: { children: ReactNode }) {
  const {
    locale,
    liteModeNoticeDisabled,
    acceptedAgreement,
    preReleaseNoticeSeenVersion,
  } = useAtomValue(settingsAtom);
  const closing = useAtomValue(walletClosingAtom);
  const locked = useAtomValue(walletLockedAtom);
  const coreConnected = useAtomValue(coreConnectedAtom);
  const [prereleaseWarningClosed, setPrereleaseWarningClosed] = useState(
    () => preReleaseNoticeSeenVersion === APP_VERSION.toString()
  );
  const closePrereleaseWarning = () => {
    setPrereleaseWarningClosed(true);
    updateSettings({ preReleaseNoticeSeenVersion: APP_VERSION.toString() });
  };
  const [testnetWarningClosed, setTestnetWarningClosed] = useState(false);

  if (closing) {
    return <ClosingScreen />;
  }

  if (locked && coreConnected) {
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

  return (
    <Wallet>
      {children}
      {preRelease && (
        <PreReleaseWarningModal
          visible={!prereleaseWarningClosed}
          removeModal={closePrereleaseWarning}
        />
      )}
      {LOCK_TESTNET && prereleaseWarningClosed && (
        <TestnetWarningModal
          visible={!testnetWarningClosed}
          removeModal={() => setTestnetWarningClosed(true)}
        />
      )}
    </Wallet>
  );
}
