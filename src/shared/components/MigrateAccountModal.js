import React, { useEffect } from 'react';
import { connect } from 'react-redux';

import Modal from 'components/Modal';
import Button from 'components/Button';
import { history } from 'lib/wallet';
import { formatNumber } from 'lib/intl';
import { openModal } from 'lib/ui';
import { loadAccounts } from 'lib/user';
import { updateSettings } from 'lib/settings';

__ = __context('MigrateAccount');

const MigrateAccountModal = ({ legacyBalance, accounts }) => {
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
                'You can manually send your funds from legacy account to this new Tritium user.'
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
  accounts: state.core.accounts,
});

export default connect(mapStateToProps)(MigrateAccountModal);
