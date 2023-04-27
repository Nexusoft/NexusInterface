import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import ControlledModal from 'components/ControlledModal';
import Button from 'components/Button';
import { navigate } from 'lib/wallet';
import { formatNumber } from 'lib/intl';
import { loadAccounts } from 'lib/user';
import { updateSettings } from 'lib/settings';

__ = __context('MigrateAccount');

export default function MigrateAccountModal({ legacyBalance }) {
  const accounts = useSelector((state) => state.user.accounts);
  useEffect(() => {
    if (!accounts) loadAccounts();
  }, []);
  const defaultAccount =
    accounts && accounts.length
      ? accounts.find((a) => a.name === 'default') || accounts[0]
      : null;
  const defaultAddress = defaultAccount && defaultAccount.address;

  return (
    <ControlledModal maxWidth={600}>
      {(closeModal) => (
        <>
          <ControlledModal.Header>
            {__('Migrate account')}
          </ControlledModal.Header>
          <ControlledModal.Body>
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
                  navigate(
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
          </ControlledModal.Body>
        </>
      )}
    </ControlledModal>
  );
}
