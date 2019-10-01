import PinDialog from 'components/PinDialog';
import { openModal } from 'lib/overlays';

export default function confirmPin({ confirmLabel } = {}) {
  return new Promise((resolve, reject) => {
    openModal(PinDialog, {
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
