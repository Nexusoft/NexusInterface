import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { openModal } from 'lib/ui';

import ClosingScreen from './ClosingScreen';
import SelectLanguage from './SelectLanguage';
import LicenseAgreement from './LicenseAgreement';
import LiteModeNotice from './LiteModeNotice';
import PotThemeModal from './PotThemeModal';
import PreReleaseWarningModal from './PreReleaseWarningModal';
import Wallet from './Wallet';
import { preRelease } from 'consts/misc';

const Overlays = ({ children }) => {
  const locale = useSelector((state) => state.settings.locale);
  const liteModeNoticeDisabled = useSelector(
    (state) => state.settings.liteModeNoticeDisabled
  );
  const acceptedAgreement = useSelector(
    (state) => state.settings.acceptedAgreement
  );
  const closing = useSelector((state) => state.ui.closing);
  const potThemeModalShown = useSelector(
    (state) => state.settings.potThemeModalShown
  );

  const showingNoOverlay =
    !closing && !!locale && !!acceptedAgreement && !!liteModeNoticeDisabled;
  useEffect(
    potThemeModalShown
      ? () => {}
      : () => {
          if (showingNoOverlay) {
            openModal(PotThemeModal);
          }
        },
    [showingNoOverlay]
  );

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

  return <Wallet>{children}</Wallet>;
};

export default Overlays;
