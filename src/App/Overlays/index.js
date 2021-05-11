import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { openModal } from 'lib/ui';

import ClosingScreen from './ClosingScreen';
import SelectLanguage from './SelectLanguage';
import LicenseAgreement from './LicenseAgreement';
import PotThemeModal from './PotThemeModal';
import Wallet from './Wallet';

const Overlays = ({ children }) => {
  const locale = useSelector((state) => state.settings.locale);

  const acceptedAgreement = useSelector(
    (state) => state.settings.acceptedAgreement
  );
  const closing = useSelector((state) => state.ui.closing);
  const potThemeModalShown = useSelector(
    (state) => state.settings.potThemeModalShown
  );

  const showingNoOverlay = !closing && !!locale && !!acceptedAgreement;
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

  return <Wallet>{children}</Wallet>;
};

export default Overlays;
