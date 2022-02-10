import { useState } from 'react';

import ControlledModal from 'components/ControlledModal';
import TextField from 'components/TextField';
import Button from 'components/Button';

__ = __context('Send');

export default function PasswordModal({ onSubmit }) {
  const [password, setPassword] = useState('');

  return (
    <ControlledModal maxWidth={500}>
      {(closeModal) => (
        <>
          <ControlledModal.Header>
            {__('Wallet password')}
          </ControlledModal.Header>
          <ControlledModal.Body>
            <TextField
              type="password"
              placeholder={__('Enter your wallet password')}
              value={password}
              onChange={(evt) => {
                setPassword(evt.target.value);
              }}
              style={{ marginTop: '.5em' }}
            />
          </ControlledModal.Body>
          <ControlledModal.Footer>
            <div className="flex space-between">
              <Button onClick={closeModal}>{__('Cancel')}</Button>
              <Button
                skin="primary"
                onClick={() => {
                  onSubmit(password);
                  closeModal();
                }}
              >
                {__('Confirm')}
              </Button>
            </div>
          </ControlledModal.Footer>
        </>
      )}
    </ControlledModal>
  );
}
