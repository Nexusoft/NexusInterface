import React from 'react';
import { connect } from 'react-redux';

import Modal from 'components/Modal';
import Button from 'components/Button';
import Link from 'components/Link';
import Icon from 'components/Icon';
import { updateSettings } from 'actions/settings';
import logoIcon from 'images/logo.sprite.svg';

const TritiumUpgradeModal = ({ updateSettings }) => (
  <Modal>
    {closeModal => (
      <>
        <Modal.Header>
          <Icon icon={logoIcon} className="space-right" />
          <span className="v-align">Tritium mainnet upgrade</span>
        </Modal.Header>
        <Modal.Body>
          <div>Tritium upgrade has finally come to Nexus mainnet!!!</div>
          <div className="mt1">
            It is recommended that you switch your wallet to{' '}
            <strong>Tritium Mode</strong> which provides you with the new
            graphical user interface to work with new Tritium features - such as
            logging in to your account using username, password and PIN number
            without a clunky wallet.dat file.
          </div>
          <div className="mt1">
            If you're staking with this wallet, don't worry,{' '}
            <strong>Tritium Mode</strong> has a "Migrate stake" feature that
            helps you migrate your stake to a new Tritium account that you
            create, keeping your Trust Score and Stake Rate unchanged.
          </div>
          <div className="mt1">
            In case you don't want to switch to <strong>Tritium Mode</strong>{' '}
            just yet, you can choose to stay in <strong>Legacy Mode</strong> for
            now and switch anytime later by going to{' '}
            {process.platform === 'darwin' ? '"Nexus"' : `"${__('File')}"`} menu
            then select "{__('Switch to Tritium Mode')}" option.
          </div>
          <div className="mt3 text-center">
            <Button
              wide
              skin="primary"
              style={{ fontSize: '1.2em' }}
              onClick={() => {
                updateSettings({ legacyMode: false });
                location.reload();
              }}
            >
              Switch to Tritium Mode
            </Button>
            <div
              className="mt1"
              onClick={() => {
                updateSettings({ legacyMode: true });
                closeModal();
              }}
            >
              <Link as="a" href="javascript:;">
                Stay in Legacy Mode
              </Link>
            </div>
          </div>
        </Modal.Body>
      </>
    )}
  </Modal>
);

const actionCreators = { updateSettings };

export default connect(
  null,
  actionCreators
)(TritiumUpgradeModal);
