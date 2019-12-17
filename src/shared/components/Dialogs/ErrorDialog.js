// External
import React from 'react';
import styled from '@emotion/styled';

// Internal
import Modal from 'components/Modal';
import * as color from 'utils/color';
import Dialog from './Dialog';

__ = __context('ErrorDialog');

const XMark = styled(Dialog.Icon)(({ theme }) => ({
  fontSize: 56,
  color: theme.danger,
  borderWidth: 3,
  filter: `drop-shadow(0 0 5px ${color.fade(theme.danger, 0.5)})`,
}));

class ErrorDialog extends React.Component {
  buttonRef = React.createRef();

  componentDidMount() {
    if (this.buttonRef.current) {
      this.buttonRef.current.focus();
    }
  }

  render() {
    const { message, note, ...rest } = this.props;
    return (
      <Dialog
        assignClose={closeModal => {
          this.closeModal = closeModal;
        }}
        {...rest}
      >
        <Modal.Body>
          <XMark>✕</XMark>
          <Dialog.Message>{message}</Dialog.Message>
          {!!note && <Dialog.Note>{note}</Dialog.Note>}
        </Modal.Body>
        <Dialog.Button
          ref={this.buttonRef}
          skin="filled-danger"
          onClick={() => this.closeModal()}
        >
          {__('Dismiss')}
        </Dialog.Button>
      </Dialog>
    );
  }
}

export default ErrorDialog;
