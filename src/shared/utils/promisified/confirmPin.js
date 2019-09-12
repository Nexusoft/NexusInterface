import store from 'store';
import PinDialog from 'components/PinDialog';
import { openModal } from 'actions/overlays';

export default function confirmPin({ confirmLabel } = {}) {
  return new Promise((resolve, reject) => {
    store.dispatch(
      openModal(PinDialog, {
        confirmLabel,
        submitPin: pin => {
          resolve(pin);
        },
        onClose: () => {
          resolve(undefined);
        },
      })
    );
  });
}
