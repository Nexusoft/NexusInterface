// External
import React from 'react';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import styled from '@emotion/styled';

// Internal
import Modal from 'components/Modal';
import Icon from 'components/Icon';
import Button from 'components/Button';
import { updateSettings } from 'actions/settings';
import * as color from 'utils/color';
import warningIcon from 'images/warning.sprite.svg';

const WarningModal = styled(Modal)({
  maxWidth: 500,
  textAlign: 'center',
});

const WarningIcon = styled(Icon)(({ theme }) => ({
  fontSize: 80,
  color: theme.danger,
  filter: `drop-shadow(0 0 5px ${color.fade(theme.danger, 0.5)})`,
  marginBottom: 20,
}));

const WarningMessage = styled.div({
  fontSize: 28,
});

@connect(
  null,
  dispatch => ({
    ignoreEncryptionWarning: () =>
      dispatch(updateSettings({ encryptionWarningDisabled: true })),
    goTo: url => dispatch(push(url)),
  })
)
class EncryptionWarningModal extends React.Component {
  ignore = () => {
    this.props.ignoreEncryptionWarning();
    this.closeModal();
  };

  goToSecuritySettings = () => {
    this.closeModal();
    this.props.goTo('/Settings/Security');
  };

  render() {
    return (
      <WarningModal
        assignClose={close => {
          this.closeModal = close;
        }}
      >
        <Modal.Body style={{ fontSize: 18 }}>
          <WarningIcon icon={warningIcon} />
          <WarningMessage>{__('Your wallet is not encrypted!')}</WarningMessage>
          <p>
            {__('You really should encrypt your wallet to keep your NXS safe.')}
          </p>
          <br />
          <div className="flex space-between">
            <Button skin="danger" onClick={this.ignore}>
              {__('Ignore')}
            </Button>
            <Button skin="primary" onClick={this.goToSecuritySettings}>
              {__('Take me there')}
            </Button>
          </div>
        </Modal.Body>
      </WarningModal>
    );
  }
}

export default EncryptionWarningModal;
