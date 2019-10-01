import { openConfirmDialog } from 'lib/overlays';

export default function confirm(options) {
  return new Promise((resolve, reject) => {
    try {
      openConfirmDialog({
        ...options,
        callbackYes: () => {
          resolve(true);
        },
        callbackNo: () => {
          resolve(false);
        },
      });
    } catch (err) {
      console.error(err);
      reject(err);
    }
  });
}
