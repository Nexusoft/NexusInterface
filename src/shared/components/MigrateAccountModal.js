import React, { useEffect } from 'react';
import { connect } from 'react-redux';

import Modal from 'components/Modal';
import MigrateStakeModal from 'components/MigrateStakeModal';
import Button from 'components/Button';
import { history } from 'lib/wallet';
import { formatNumber } from 'lib/intl';
import { openModal } from 'lib/ui';
import { loadAccounts } from 'lib/user';
import { updateSettings } from 'lib/settings';

const MigrateAccountModal = ({ legacyBalance, isNewAccount, accounts }) => {
  useEffect(() => {
    if (!accounts) loadAccounts();
  }, []);
  const defaultAccount =
    accounts && accounts.length
      ? accounts.find(a => a.name === 'default') || accounts[0]
      : null;
  const defaultAddress = defaultAccount && defaultAccount.address;

  return (
    <Modal style={{ maxWidth: 600 }}>
      {closeModal => (
        <>
          <Modal.Header>{__('Migrate account')}</Modal.Header>
          <Modal.Body>
            <div>
              {__('You have %{amount} NXS in your legacy account.', {
                amount: formatNumber(legacyBalance, 6),
              })}
            </div>

            <div className="mt2">
              {__(
                'If you have been staking with your legacy account, click Migrate stake button below to move both your stake amount and your trust score to this new Tritium user.'
              )}
            </div>
            <div className="mt1 text-center">
              <Button
                skin="primary"
                disabled={!isNewAccount}
                onClick={() => {
                  closeModal();
                  openModal(MigrateStakeModal);
                }}
              >
                {__('Migrate stake')}
              </Button>
              {!isNewAccount && (
                <div
                  className="mt1 error"
                  style={{
                    fontStyle: 'italic',
                    padding: '0 50px',
                  }}
                >
                  {__(
                    'Cannot migrate stake since this Tritium user has already started staking before. Please create a new user if you still want to migrate your stake.'
                  )}
                </div>
              )}
            </div>

            <div className="mt2">
              {__(
                'If you have never started staking, or have already migrated your stake, you can manually send your funds from legacy account to this new Tritium user.'
              )}
            </div>
            <div className="mt1">
              {__(
                'Please keep in mind that you may lose your legacy trust score if you send NXS manually from your legacy account without migrating your stake first'
              )}
            </div>
            <div className="mt1 text-center">
              <Button
                onClick={() => {
                  updateSettings({ legacyMode: true });
                  history.push(
                    `/Send${defaultAddress ? `?sendTo=${defaultAddress}` : ''}`
                  );
                  window.location.reload();
                }}
              >
                {__('Send NXS manually')}
              </Button>
            </div>

            <div className="mt3 text-center">
              <Button
                skin="hyperlink"
                onClick={() => {
                  updateSettings({ migrateSuggestionDisabled: true });
                  closeModal();
                }}
              >
                {__("Don't show this again")}
              </Button>
            </div>
          </Modal.Body>
        </>
      )}
    </Modal>
  );
};

const mapStateToProps = state => ({
  isNewAccount: state.core.stakeInfo.new,
  accounts: state.core.accounts,
});

export default connect(mapStateToProps)(MigrateAccountModal);
