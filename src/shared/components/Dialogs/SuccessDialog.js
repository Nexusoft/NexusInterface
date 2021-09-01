// External
import { createRef, Component } from 'react';
import styled from '@emotion/styled';

// Internal
import ControlledModal from 'components/ControlledModal';
import Icon from 'components/Icon';
import * as color from 'utils/color';
import checkIcon from 'icons/check.svg';
import Dialog from './Dialog';

__ = __context('SuccessDialog');

const CheckMark = styled(Dialog.Icon)(({ theme }) => ({
  fontSize: 44,
  color: theme.primary,
  borderWidth: 3,
  filter: `drop-shadow(0 0 5px ${color.fade(theme.primary, 0.5)})`,
}));

class SuccessDialog extends Component {
  buttonRef = createRef();

  componentDidMount() {
    if (this.buttonRef.current) {
      this.buttonRef.current.focus();
    }
  }

  render() {
    const { message, note, ...rest } = this.props;
    return (
      <Dialog
        assignClose={(closeModal) => {
          this.closeModal = closeModal;
        }}
        {...rest}
      >
        <ControlledModal.Body>
          <CheckMark>
            <Icon icon={checkIcon} />
          </CheckMark>
          <Dialog.Message>{message}</Dialog.Message>
          {!!note && <Dialog.Note>{note}</Dialog.Note>}
        </ControlledModal.Body>
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
