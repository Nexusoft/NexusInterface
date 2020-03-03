import PinDialog from 'components/PinDialog';
import { openModal } from 'lib/ui';

export default function confirmPin({ label, confirmLabel } = {}) {
  return new Promise((resolve, reject) => {
    openModal(PinDialog, {
      label,
      confirmLabel,
      submitPin: pin => {
        resolve(pin);
      },
      onClose: () => {
        resolve(undefined);
      },
    });
  });
}
