// External
import { memo, useContext } from 'react';

// Internal
import Modal, { ModalProps } from 'components/Modal';
import ModalContext from 'context/modal';
import { removeModal } from 'lib/ui';

interface ControlledModalType
  extends React.MemoExoticComponent<React.FC<Omit<ModalProps, 'removeModal'>>> {
  Header: typeof Modal.Header;
  Body: typeof Modal.Body;
  Footer: typeof Modal.Footer;
}

const ControlledModal: ControlledModalType = memo(
  ({ ...props }: ModalProps) => {
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
) as ControlledModalType;

ControlledModal.displayName = 'ControlledModal';
ControlledModal.Header = Modal.Header;
ControlledModal.Body = Modal.Body;
ControlledModal.Footer = Modal.Footer;

export default ControlledModal;
