import store from 'store';
import { openConfirmDialog } from 'actions/overlays';

export default function confirm(options) {
  return new Promise((resolve, reject) => {
    try {
      store.dispatch(
        openConfirmDialog({
          ...options,
          callbackYes: () => {
            resolve(true);
          },
          callbackNo: () => {
            resolve(false);
          },
        })
      );
    } catch (err) {
      console.error(err);
      reject(err);
    }
  });
}
