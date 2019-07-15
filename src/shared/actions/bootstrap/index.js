// Internal
import store from 'store';
import { openConfirmDialog, openModal } from 'actions/overlays';
import { clearCoreInfo } from 'actions/core';
import { updateSettings } from 'actions/settings';
import Bootstrapper from './Bootstrapper';
import BootstrapModal from './BootstrapModal';

let running = false;

/**
 * Bootstrap Modal element
 *
 * @export
 * @param {*} [{ suggesting }={}]
 * @returns
 */
export default function bootstrap({ suggesting } = {}) {
  return async (dispatch, getState) => {
    // Only one instance at the same time
    if (running) return;

    running = true;
    const state = getState();
    store.dispatch(
      openConfirmDialog({
        question: 'Download recent database?',
        note:
          'Downloading a recent version of the database might reduce the time it takes to synchronize your wallet',
        labelYes: "Yes, let's bootstrap it",
        callbackYes: async () => {
          const bootstrapper = new Bootstrapper();
          try {
            store.dispatch(openModal(BootstrapModal, { bootstrapper }));
          } catch (err) {
            running = false;
            throw err;
          }
          const startBootstrapping = async () => {
            try {
              await bootstrapper.start({
                backupFolder: state.settings.backupDirectory,
                clearCoreInfo: () => {
                  dispatch(clearCoreInfo());
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
        labelNo: 'No, let it sync',
        skinNo: suggesting ? 'danger' : undefined,
        callbackNo: () => {
          running = false;
          if (suggesting) {
            dispatch(
              updateSettings({
                bootstrapSuggestionDisabled: true,
              })
            );
          }
        },
        style: { width: 530 },
      })
    );
  };
}

const checkFreeSpace = Bootstrapper.checkFreeSpace;
const checkBootStrapFreeSpace = Bootstrapper.checkBootStrapFreeSpace;
export { checkFreeSpace, checkBootStrapFreeSpace };
