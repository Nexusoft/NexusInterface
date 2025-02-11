import ConfirmDialog, {
  ConfirmDialogProps,
} from 'components/Dialogs/ConfirmDialog';
import ConfirmPasswordPinDialog, {
  ConfirmPasswordPinDialogProps,
} from 'components/Dialogs/ConfirmPasswordPinDialog';
import ErrorDialog, { ErrorDialogProps } from 'components/Dialogs/ErrorDialog';
import InfoDialog, { InfoDialogProps } from 'components/Dialogs/InfoDialog';
import PinDialog, { PinDialogProps } from 'components/Dialogs/PinDialog';
import SuccessDialog, {
  SuccessDialogProps,
} from 'components/Dialogs/SuccessDialog';
import { openModal } from 'lib/ui';

export const openConfirmDialog = (props?: ConfirmDialogProps) =>
  openModal(ConfirmDialog, props);

export const openErrorDialog = (props?: ErrorDialogProps) =>
  openModal(ErrorDialog, props);

export const openSuccessDialog = (props?: SuccessDialogProps) =>
  openModal(SuccessDialog, props);

export const openInfoDialog = (props?: InfoDialogProps) =>
  openModal(InfoDialog, props);

export function confirm(
  options: Omit<ConfirmDialogProps, 'callbackYes' | 'callbackNo'>
) {
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

export function confirmPin(
  options?: Omit<PinDialogProps, 'submitPin' | 'onClose'>
) {
  return new Promise<string | undefined>((resolve) => {
    openModal(PinDialog, {
      ...options,
      submitPin: (pin) => {
        resolve(pin);
      },
      onClose: () => {
        resolve(undefined);
      },
    });
  });
}

export function confirmPasswordPin({
  enteredPassword,
  enteredPin,
  isNew,
}: ConfirmPasswordPinDialogProps) {
  return new Promise((resolve) => {
    openModal(ConfirmPasswordPinDialog, {
      isNew,
      enteredPassword,
      enteredPin,
      onConfirm: () => {
        resolve(true);
      },
      onClose: () => {
        resolve(false);
      },
    });
  });
}
