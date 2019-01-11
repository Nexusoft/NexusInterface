// External
import React from 'react';
import styled from '@emotion/styled';
import { Link } from 'react-router-dom';

// Internal
import Modal from 'components/Modal';
import Icon from 'components/Icon';
import Text from 'components/Text';
import Button from 'components/Button';
import { GetSettings, SaveSettings } from 'api/settings';
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

const EncryptionWarningModal = props => (
  <WarningModal props>
    {closeModal => (
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
          <Button
            skin="error"
            onClick={() => {
              closeModal();
              const settings = GetSettings();
              SaveSettings({
                ...settings,
                ignoreEncryptionWarningFlag: true,
              });
            }}
          >
            <Text id="overview.Ignore" />
          </Button>
          <Button
            as={Link}
            skin="primary"
            to="/Settings/Security"
            onClick={closeModal}
          >
            <Text id="overview.TakeMeThere" />
          </Button>
        </div>
      </Modal.Body>
    )}
  </WarningModal>
);

export default EncryptionWarningModal;
