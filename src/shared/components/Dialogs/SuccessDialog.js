// External
import React from 'react';
import styled from '@emotion/styled';

// Internal
import Modal from 'components/Modal';
import Icon from 'components/Icon';
import * as color from 'utils/color';
import checkIcon from 'icons/check.svg';
import Dialog from './Dialog';

const CheckMark = styled(Dialog.Icon)(({ theme }) => ({
  fontSize: 44,
  color: theme.primary,
  borderWidth: 3,
  filter: `drop-shadow(0 0 5px ${color.fade(theme.primary, 0.5)})`,
}));

class SuccessDialog extends React.Component {
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
          <CheckMark>
            <Icon icon={checkIcon} />
          </CheckMark>
          <Dialog.Message>{message}</Dialog.Message>
          {!!note && <Dialog.Note>{note}</Dialog.Note>}
        </Modal.Body>
        <Dialog.Button
          ref={this.buttonRef}
          skin="filled-primary"
          onClick={() => this.closeModal()}
        >
          {__('Dismiss')}
        </Dialog.Button>
      </Dialog>
    );
  }
}

export default SuccessDialog;
