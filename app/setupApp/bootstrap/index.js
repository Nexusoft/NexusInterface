// External
import React from 'react';

// Internal
import UIController from 'components/UIController';
import Text from 'components/Text';
import * as ac from 'actions/headerActionCreators';
import Bootstrapper from './Bootstrapper';
import BootstrapModal from './BootstrapModal';

let bootstrapper = null;

export default async function bootstrap(store) {
  // Skip if already bootstrapping
  if (bootstrapper) return;

  const enoughSpace = await Bootstrapper.checkFreeSpace();
  if (!enoughSpace) {
    UIController.openErrorDialog({
      message: <Text id="ToolTip.NotEnoughSpace" />,
    });
    return;
  }

  const state = store.getState();
  if (
    state.overview.connections === undefined ||
    state.settings.settings.manualDaemon
  ) {
    UIController.showNotification('Please wait for the daemon to start.');
    return;
  }

  UIController.openConfirmDialog({
    question: 'Download recent database?',
    note:
      'Downloading a recent version of the database might reduce the time it takes to synchronize your wallet',
    yesLabel: "Yes, let's bootstrap it",
    noLabel: 'No, let it sync',
    yesCallback: async () => {
      bootstrapper = new Bootstrapper();
      try {
        UIController.openModal(BootstrapModal, { bootstrapper });
      } catch (err) {
        bootstrapper = null;
        throw err;
      }
      const startBootstrapping = async () => {
        try {
          await bootstrapper.start({
            backupFolder: state.settings.settings.Folder,
            clearOverviewVariables: () => {
              store.dispatch(ac.clearOverviewVariables());
            },
          });
        } finally {
          bootstrapper = null;
        }
      };
      // Defer starting bootstrap so that the BootstrapModal can
      // register events in its constructor before the bootstrap starts
      setTimeout(startBootstrapping, 0);
    },
    style: { width: 530 },
  });
}
