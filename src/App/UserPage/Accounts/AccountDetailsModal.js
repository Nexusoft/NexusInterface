import { useSelector } from 'react-redux';

import ControlledModal from 'components/ControlledModal';
import Button from 'components/Button';
import InfoField from 'components/InfoField';
import AdjustStakeModal from 'components/AdjustStakeModal';
import QRButton from 'components/QRButton';
import TokenName from 'components/TokenName';
import { goToSend } from 'lib/send';
import { formatDateTime, formatNumber } from 'lib/intl';
import { openModal } from 'lib/ui';

import { totalBalance } from './utils';

__ = __context('User.Accounts.AccountDetails');

const timeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
};

export default function AccountDetailsModal({ account }) {
  const stakeInfo = useSelector((state) => state.user.stakeInfo);
  return (
    <ControlledModal>
      {(closeModal) => (
        <>
          <ControlledModal.Header>
            {__('Account Details')}
          </ControlledModal.Header>
          <ControlledModal.Body>
            <InfoField ratio={[1, 2]} label={__('Account name')}>
              {account.name ? (
                <span>{account.name}</span>
              ) : (
                <span className="dim">{__('Unnamed')}</span>
              )}
            </InfoField>
            <InfoField ratio={[1, 2]} label={__('Created at')}>
              {formatDateTime(account.created * 1000, timeFormatOptions)}
            </InfoField>
            <InfoField ratio={[1, 2]} label={__('Last modified')}>
              {formatDateTime(account.modified * 1000, timeFormatOptions)}
            </InfoField>
            <InfoField ratio={[1, 2]} label={__('Token')}>
              <TokenName account={account} />
            </InfoField>
            {account.data !== undefined && (
              <InfoField ratio={[1, 2]} label={__('Data')}>
                {account.data}
              </InfoField>
            )}
            <InfoField ratio={[1, 2]} label={__('Total account balance')}>
              {formatNumber(totalBalance(account), 6)}{' '}
              <TokenName account={account} />
            </InfoField>
            <InfoField ratio={[1, 2]} label={__('Available balance')}>
              <span className="v-align">
                {formatNumber(account.balance, 6)}{' '}
                <TokenName account={account} />
              </span>
              &nbsp;&nbsp;
              {account.balance > 0 && (
                <Button
                  skin="hyperlink"
                  className="v-align"
                  onClick={() => {
                    closeModal();
                    goToSend({ sendFrom: `account:${account.address}` });
                  }}
                >
                  {__('Send %{token_name}', {
                    token_name: TokenName.from({ account }),
                  })}
                </Button>
              )}
            </InfoField>
            {account.unclaimed !== undefined && (
              <InfoField ratio={[1, 2]} label={__('Unclaimed balance')}>
                {formatNumber(account.unclaimed, 6)}{' '}
                <TokenName account={account} />
              </InfoField>
            )}
            {account.unconfirmed !== undefined && (
              <InfoField ratio={[1, 2]} label={__('Unconfirmed balance')}>
                {formatNumber(account.unconfirmed, 6)}{' '}
                <TokenName account={account} />
              </InfoField>
            )}
            {account.stake !== undefined && (
              <InfoField ratio={[1, 2]} label={__('Stake balance')}>
                {formatNumber(account.stake, 6)} <TokenName account={account} />
              </InfoField>
            )}
            {account.immature !== undefined && (
              <InfoField ratio={[1, 2]} label={__('Immature balance')}>
                {formatNumber(account.immature, 6)}{' '}
                <TokenName account={account} />
              </InfoField>
            )}
            <InfoField ratio={[1, 2]} label={__('Address')}>
              <span className="monospace v-align">{account.address}</span>
              <QRButton address={account.address} className="ml0_4" />
            </InfoField>

            {account.stake !== undefined && (
              <div className="mt1 flex space-between">
                <div />{' '}
                {!stakeInfo.stake && !stakeInfo.balance ? (
                  <div className="error">{__('Trust Account is empty.')}</div>
                ) : (
                  stakeInfo.new && (
                    <div className="error">
                      {__(
                        'Trust Account must mature for 72 hours before staking'
                      )}
                    </div>
                  )
                )}
                <Button
                  disabled={
                    !stakeInfo ||
                    (!stakeInfo.stake && !stakeInfo.balance) ||
                    stakeInfo.new
                  }
                  onClick={() => {
                    openModal(AdjustStakeModal);
                  }}
                >
                  {__('Adjust stake amount')}
                </Button>
              </div>
            )}
          </ControlledModal.Body>
        </>
      )}
    </ControlledModal>
  );
}
