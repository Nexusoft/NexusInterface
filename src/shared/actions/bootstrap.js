// Internal
import * as TYPE from 'consts/actionTypes';
import { openConfirmDialog, openModal } from 'actions/overlays';
import { updateSettings } from 'actions/settings';
import { startBootstrap, checkFreeSpaceForBootstrap } from 'lib/bootstrap';
import BootstrapModal from 'components/BootstrapModal';

export const setBootstrapStatus = (step, details) => ({
  type: TYPE.BOOTSTRAP_STATUS,
  payload: { step, details },
});

/**
 * Bootstrap Modal element
 *
 * @export
 * @param {*} [{ suggesting }={}]
 * @returns
 */
export function bootstrap({ suggesting } = {}) {
  return async (dispatch, getState) => {
    // Only one instance at the same time
    const state = getState();
    if (state.bootstrap.step !== 'idle') return;

    const enoughSpace = await checkFreeSpaceForBootstrap();
    if (!enoughSpace) {
      if (!suggesting) {
        store.dispatch(
          openErrorDialog({
            message: <Text id="ToolTip.NotEnoughSpace" />,
          })
        );
      }
      return;
    }

    dispatch(setBootstrapStatus('prompting'));
    dispatch(
      openConfirmDialog({
        question: 'Download recent database?',
        note:
          'Downloading a recent version of the database might reduce the time it takes to synchronize your wallet',
        labelYes: "Yes, let's bootstrap it",
        callbackYes: () => {
          startBootstrap({ dispatch, getState });
          dispatch(openModal(BootstrapModal));
        },
        labelNo: 'No, let it sync',
        skinNo: suggesting ? 'danger' : undefined,
        callbackNo: () => {
          dispatch(setBootstrapStatus('idle'));
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
