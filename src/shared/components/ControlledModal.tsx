// External
import { memo, useContext, ComponentProps } from 'react';

// Internal
import Modal, { ModalProps } from 'components/Modal';
import ModalContext from 'context/modal';
import { removeModal } from 'lib/ui';

const ControlledModalComponent = memo(
  (props: Omit<ModalProps, 'removeModal'>) => {
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
);

type ControlledModalType = typeof ControlledModalComponent & {
  Header: typeof Modal.Header;
  Body: typeof Modal.Body;
  Footer: typeof Modal.Footer;
};
const ControlledModal = ControlledModalComponent as ControlledModalType;
ControlledModal.Header = Modal.Header;
ControlledModal.Body = Modal.Body;
ControlledModal.Footer = Modal.Footer;

export default ControlledModal;

export type ControlledModalProps = ComponentProps<typeof ControlledModal>;
