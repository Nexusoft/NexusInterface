import ConfirmPasswordPinModal from 'components/ConfirmPasswordPinModal';
import { openModal } from 'lib/ui';

export default function confirmPasswordPin({ password, pin, isNew }) {
  return new Promise((resolve, reject) => {
    openModal(ConfirmPasswordPinModal, {
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
