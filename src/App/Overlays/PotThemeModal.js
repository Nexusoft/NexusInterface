import { useState } from 'react';

import Button from 'components/Button';
import ControlledModal from 'components/ControlledModal';
import { updateSettings } from 'lib/settings';
import { potTheme, setTheme } from 'lib/theme';
import store from 'store';

import potImg from './potcoin.png';

__ = __context('PotThemeIntro');

export default function PotThemeModal() {
  const [previousTheme, setPreviousTheme] = useState(null);
  const tryPotTheme = () => {
    setPreviousTheme(store.getState().theme);
    setTheme(potTheme);
  };
  const revertTheme = () => {
    setTheme(previousTheme);
    setPreviousTheme(null);
  };

  return (
    <ControlledModal
      maxWidth={600}
      onClose={() => {
        updateSettings({ potThemeModalShown: true });
      }}
    >
      {(closeModal) => (
        <>
          <ControlledModal.Header>
            {__('Introducing POT theme')}
          </ControlledModal.Header>
          <ControlledModal.Body>
            <div className="text-center">
              <img src={potImg} width={100} height={100} />
            </div>

            <div className="mt1">
              {__(
                "To celebrate PotCoin's migration to Nexus ecosystem, we would like to introduce a new integrated theme named POT, in addition to the current default Dark theme and Light theme."
              )}
            </div>

            <div className="mt1">
              {__(
                'You can always change your theme setting later under Settings/Style tab.'
              )}
            </div>

            <div className="mt3 flex space-between">
              <Button
                skin="primary"
                onClick={previousTheme ? revertTheme : tryPotTheme}
              >
                {previousTheme
                  ? __('Revert to previous theme')
                  : __('Try out POT theme')}
              </Button>
              <Button skin="default" onClick={closeModal}>
                {__('Done')}
              </Button>
            </div>
          </ControlledModal.Body>
        </>
      )}
    </ControlledModal>
  );
}
