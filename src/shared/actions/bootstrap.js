import * as TYPE from 'consts/actionTypes';
import {
  openConfirmDialog,
  openModal,
  openErrorDialog,
} from 'actions/overlays';
import { updateSettings } from 'actions/settings';
import { startBootstrap, checkFreeSpaceForBootstrap } from 'lib/bootstrap';
import BootstrapModal from 'components/BootstrapModal';
import store from 'store';

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

    dispatch(setBootstrapStatus('prompting'));
    const enoughSpace = await checkFreeSpaceForBootstrap();
    if (!enoughSpace) {
      if (!suggesting) {
        store.dispatch(
          openErrorDialog({
            message: __(
              'Not enough disk space! Minimum 15GB of free space is required.'
            ),
          })
        );
      }
      dispatch(setBootstrapStatus('idle'));
      return;
    }

    dispatch(
      openConfirmDialog({
        question: __('Download recent database?'),
        note: __(
          'Downloading a recent version of the database might reduce the time it takes to synchronize your wallet'
        ),
        labelYes: __("Yes, let's bootstrap it"),
        callbackYes: () => {
          startBootstrap({ dispatch, getState });
          dispatch(openModal(BootstrapModal));
        },
        labelNo: __('No, let it sync'),
        skinNo: suggesting ? 'danger' : undefined,
        callbackNo: () => {
          if (suggesting) {
            dispatch(
              updateSettings({
                bootstrapSuggestionDisabled: true,
              })
            );
          }
          dispatch(setBootstrapStatus('idle'));
        },
        style: { width: 530 },
      })
    );
  };
}
