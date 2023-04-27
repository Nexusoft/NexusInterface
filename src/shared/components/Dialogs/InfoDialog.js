// External
import { createRef, Component } from 'react';
import styled from '@emotion/styled';

// Internal
import ControlledModal from 'components/ControlledModal';
import Icon from 'components/Icon';
import * as color from 'utils/color';
import infoIcon from 'icons/info.svg';
import Dialog from './Dialog';

__ = __context('InfoDialog');

const InfoMark = styled(Dialog.Icon)(({ theme }) => ({
  fontSize: 44,
  color: theme.mixer(0.75),
  borderWidth: 3,
  filter: `drop-shadow(0 0 5px ${color.fade(theme.mixer(0.75), 0.5)})`,
}));

class InfoDialog extends Component {
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
          <InfoMark>
            <Icon icon={infoIcon} />
          </InfoMark>
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

export default InfoDialog;
