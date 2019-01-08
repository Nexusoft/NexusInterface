// External
import React from 'react';

// Internal
import Modal from 'components/Modal';
import Button from 'components/Button';
import { GetSettings, SaveSettings } from 'api/settings';

const ExperimentalWarningModal = props => (
  <Modal style={{ maxWidth: 600 }} {...props}>
    {closeModal => (
      <Modal.Layout>
        <Modal.Body style={{ fontSize: 18 }}>
          <p>
            THIS SOFTWARE IS EXPERIMENTAL AND IN BETA TESTING. BY DEFAULT IT
            WILL NOT USE ANY EXISTING NEXUS WALLET NOR ADDRESSES THAT YOU MAY
            ALREADY HAVE.
          </p>
          <p>
            AS SUCH, THIS WALLET SHOULD{' '}
            <strong>
              <u>NOT</u>
            </strong>{' '}
            BE USED AS YOUR PRIMARY WALLET AND DOING SO MAY AFFECT YOUR ABILITY
            TO ACCESS YOUR COINS UP TO AND INCLUDING LOSING THEM PERMANENTLY.
          </p>
          <p>USE THIS SOFTWARE AT YOUR OWN RISK.</p>
          <p className="flex space-between" style={{ marginTop: '2em' }}>
            <Button
              onClick={() => {
                closeModal();
                const settings = GetSettings();
                SaveSettings({ ...settings, experimentalWarning: false });
              }}
            >
              Don't show this again
            </Button>
            <Button skin="primary" onClick={closeModal}>
              OK
            </Button>
          </p>
        </Modal.Body>
      </Modal.Layout>
    )}
  </Modal>
);

export default ExperimentalWarningModal;
