// External
import { memo, useContext } from 'react';

// Internal
import Modal from 'components/Modal';
import ModalContext from 'context/modal';
import { removeModal } from 'lib/ui';

function ControlledModal({ ...props }) {
  const modalID = useContext(ModalContext);

  return (
    <Modal
      {...props}
      visible={true}
      removeModal={() => {
        removeModal(modalID);
      }}
    />
  );
}

ControlledModal = memo(ControlledModal);

ControlledModal.Header = Modal.Header;
ControlledModal.Body = Modal.Body;
ControlledModal.Footer = Modal.Footer;

export default ControlledModal;
