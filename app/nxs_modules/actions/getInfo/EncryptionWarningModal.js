// External
import React from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';
import { Link } from 'react-router-dom';

// Internal
import Modal from 'components/Modal';
import Icon from 'components/Icon';
import Text from 'components/Text';
import Button from 'components/Button';
import { updateSettings } from 'actions/settingsActionCreators';
import { color } from 'utils';
import warningIcon from 'images/warning.sprite.svg';

const WarningModal = styled(Modal)({
  maxWidth: 500,
  textAlign: 'center',
});

const WarningIcon = styled(Icon)(({ theme }) => ({
  fontSize: 80,
  color: theme.error,
  filter: `drop-shadow(0 0 5px ${color.fade(theme.error, 0.5)})`,
  marginBottom: 20,
}));

const WarningMessage = styled.div({
  fontSize: 28,
});

@connect(
  null,
  dispatch => ({
    updateSettings: updates => dispatch(updateSettings(updates)),
  })
)
class EncryptionWarningModal extends React.Component {
  ignore = () => {
    this.closeModal();
    this.props.updateSettings({ ignoreEncryptionWarningFlag: true });
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
          <WarningMessage>
            <Text id="overview.EncryptedModal" />
          </WarningMessage>
          <p>
            <Text id="overview.Suggestion" />
          </p>
          <br />
          <div className="flex space-between">
            <Button skin="error" onClick={this.ignore}>
              <Text id="overview.Ignore" />
            </Button>
            <Button
              as={Link}
              skin="primary"
              to="/Settings/Security"
              onClick={this.closeModal}
            >
              <Text id="overview.TakeMeThere" />
            </Button>
          </div>
        </Modal.Body>
      </WarningModal>
    );
  }
}

export default EncryptionWarningModal;
