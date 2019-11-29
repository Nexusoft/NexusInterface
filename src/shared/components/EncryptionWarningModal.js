// External
import React from 'react';
import { history } from 'lib/wallet';
import styled from '@emotion/styled';

// Internal
import Modal from 'components/Modal';
import Icon from 'components/Icon';
import Button from 'components/Button';
import { updateSettings } from 'lib/settings';
import * as color from 'utils/color';
import warningIcon from 'icons/warning.svg';

__ = __context('EncryptionWarning');

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

class EncryptionWarningModal extends React.Component {
  ignore = () => {
    updateSettings({ encryptionWarningDisabled: true });
    this.closeModal();
  };

  goToSecuritySettings = () => {
    this.closeModal();
    history.push('/Settings/Security');
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
            {__(
              'It is highly recommended that you should encrypt your wallet to keep your NXS safe.'
            )}
          </p>
          <br />
          <div className="flex space-between">
            <Button skin="danger" onClick={this.ignore}>
              {__('Ignore')}
            </Button>
            <Button skin="primary" onClick={this.goToSecuritySettings}>
              {__('Encrypt wallet')}
            </Button>
          </div>
        </Modal.Body>
      </WarningModal>
    );
  }
}

export default EncryptionWarningModal;
