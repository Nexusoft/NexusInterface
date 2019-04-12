import UIController from 'components/UIController';

export default function confirm(options) {
  return new Promise((resolve, reject) => {
    try {
      UIController.openConfirmDialog({
        ...options,
        yesCallback: () => {
          resolve(true);
        },
        noCallback: () => {
          resolve(false);
        },
      });
    } catch (err) {
      console.error(err);
      reject(err);
    }
  });
}
