import ConfirmDialog from 'components/Dialogs/ConfirmDialog';
import ErrorDialog from 'components/Dialogs/ErrorDialog';
import SuccessDialog from 'components/Dialogs/SuccessDialog';
import InfoDialog from 'components/Dialogs/InfoDialog';
import PinDialog from 'components/Dialogs/PinDialog';
import ConfirmPasswordPinDialog from 'components/Dialogs/ConfirmPasswordPinDialog';
import { openModal } from 'lib/ui';

export const openConfirmDialog = (props) => openModal(ConfirmDialog, props);

export const openErrorDialog = (props) => openModal(ErrorDialog, props);

export const openSuccessDialog = (props) => openModal(SuccessDialog, props);

export const openInfoDialog = (props) => openModal(InfoDialog, props);

export function confirm(options) {
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

export function confirmPin({ note, confirmLabel } = {}) {
  return new Promise((resolve, reject) => {
    openModal(PinDialog, {
      note,
      confirmLabel,
      submitPin: (pin) => {
        resolve(pin);
      },
      onClose: () => {
        resolve(undefined);
      },
    });
  });
}

export function confirmPasswordPin({ password, pin, isNew }) {
  return new Promise((resolve, reject) => {
    openModal(ConfirmPasswordPinDialog, {
      isNew,
      password,
      pin,
      onConfirm: () => {
        resolve(true);
      },
      onClose: () => {
        resolve(false);
      },
    });
  });
}
