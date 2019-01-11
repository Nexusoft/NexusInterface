// Internal
import UIController from 'components/UIController';
import { GetSettings, SaveSettings } from 'api/settings';
import * as ac from 'actions/setupAppActionCreators';
import Bootstrapper from './Bootstrapper';
import BootstrapModal from './BootstrapModal';

let running = false;

export default function bootstrap({ suggesting } = {}) {
  return async (dispatch, getState) => {
    // Only one instance at the same time
    if (running) return;

    running = true;
    const state = getState();
    UIController.openConfirmDialog({
      question: 'Download recent database?',
      note:
        'Downloading a recent version of the database might reduce the time it takes to synchronize your wallet',
      yesLabel: "Yes, let's bootstrap it",
      yesCallback: async () => {
        const bootstrapper = new Bootstrapper();
        try {
          UIController.openModal(BootstrapModal, { bootstrapper });
        } catch (err) {
          running = false;
          throw err;
        }
        const startBootstrapping = async () => {
          try {
            await bootstrapper.start({
              backupFolder: state.settings.settings.Folder,
              clearOverviewVariables: () => {
                dispatch(ac.clearOverviewVariables());
              },
            });
          } finally {
            running = false;
          }
        };
        // Defer starting bootstrap so that the BootstrapModal can
        // register events in its constructor before the bootstrap starts
        setTimeout(startBootstrapping, 0);
      },
      noLabel: 'No, let it sync',
      noSkin: suggesting ? 'error' : undefined,
      noCallback: () => {
        running = false;
        if (suggesting) {
          const settings = GetSettings();
          SaveSettings({ ...settings, bootstrap: false });
        }
      },
      style: { width: 530 },
    });
  };
}

const checkFreeSpace = Bootstrapper.checkFreeSpace;
export { checkFreeSpace };
