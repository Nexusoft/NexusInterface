// External
import styled from '@emotion/styled';

// Internal
import ControlledModal from 'components/ControlledModal';
import Icon from 'components/Icon';
import Button from 'components/Button';
import { navigate } from 'lib/wallet';
import { updateSettings } from 'lib/settings';
import * as color from 'utils/color';
import warningIcon from 'icons/warning.svg';

__ = __context('EncryptionWarning');

const WarningModal = styled(ControlledModal)({
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

export default function EncryptionWarningModal() {
  return (
    <WarningModal>
      {(closeModal) => (
        <>
          <ControlledModal.Body style={{ fontSize: 18 }}>
            <WarningIcon icon={warningIcon} />
            <WarningMessage>
              {__('Your wallet is not encrypted!')}
            </WarningMessage>
            <p>
              {__(
                'It is highly recommended that you should encrypt your wallet to keep your NXS safe.'
              )}
            </p>
            <br />
            <div className="flex space-between">
              <Button
                skin="danger"
                onClick={() => {
                  updateSettings({ encryptionWarningDisabled: true });
                  closeModal();
                }}
              >
                {__('Ignore')}
              </Button>
              <Button
                skin="primary"
                onClick={() => {
                  closeModal();
                  navigate('/Settings/Security');
                }}
              >
                {__('Encrypt wallet')}
              </Button>
            </div>
          </ControlledModal.Body>
        </>
      )}
    </WarningModal>
  );
}
