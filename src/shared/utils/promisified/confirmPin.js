import PinDialog from 'components/PinDialog';
import { openModal } from 'lib/ui';

export default function confirmPin({ note, confirmLabel } = {}) {
  return new Promise((resolve, reject) => {
    openModal(PinDialog, {
      note,
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
