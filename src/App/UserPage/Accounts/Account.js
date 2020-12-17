import styled from '@emotion/styled';

import Link from 'components/Link';
import NexusAddress from 'components/NexusAddress';
import QRButton from 'components/QRButton';
import { formatNumber } from 'lib/intl';
import { openModal } from 'lib/ui';
import { getTokenName } from 'lib/tokens';
import AccountDetailsModal from './AccountDetailsModal';
import AccountHistoryModal from './AccountHistoryModal';
import RenameAccountModal from './RenameAccountModal';
import { totalBalance } from './utils';

__ = __context('User.Accounts');

const AccountComponent = styled.div(({ theme }) => ({
  padding: '1em 0 1.5em',
  // borderBottom: `1px solid ${theme.mixer(0.125)}`,
}));

const AccountName = styled.span(({ theme }) => ({
  fontWeight: 'bold',
  color: theme.foreground,
}));

const UnNamed = styled(AccountName)(({ theme }) => ({
  fontStyle: 'italic',
  color: theme.mixer(0.8),
}));

const Account = ({ account }) => (
  <AccountComponent>
    <div className="flex space-between">
      <div>
        <span
          style={{ cursor: 'pointer' }}
          onClick={() => {
            openModal(AccountDetailsModal, { account });
          }}
        >
          {!account.name && <UnNamed>{__('Unnamed account')}</UnNamed>}
          <AccountName>{account.name}</AccountName>
          <span>
            {' '}
            ({formatNumber(totalBalance(account))}{' '}
            {getTokenName(account, { markup: false })})
          </span>
        </span>
      </div>
      <div>
        {account.name !== 'default' && (
          <Link
            as="a"
            onClick={() => {
              openModal(RenameAccountModal, { account });
            }}
          >
            {__('Rename')}
          </Link>
        )}
        &nbsp;&nbsp;
        <Link
          as="a"
          onClick={() => {
            openModal(AccountDetailsModal, { account });
          }}
        >
          {__('Details')}
        </Link>
        &nbsp;&nbsp;
        <Link
          as="a"
          onClick={() => {
            openModal(AccountHistoryModal, { account });
          }}
        >
          {__('History')}
        </Link>
      </div>
    </div>
    <NexusAddress
      address={account.address}
      label={
        <div className="flex center space-between">
          <span>
            {__(
              '<b>%{account_name}</b> account address',
              {
                account_name: account.name || __('Unnamed'),
              },
              {
                b: (text) =>
                  account.name ? (
                    <strong>{text}</strong>
                  ) : (
                    <UnNamed>{text}</UnNamed>
                  ),
              }
            )}
          </span>
          <QRButton address={account.address} />
        </div>
      }
    />
  </AccountComponent>
);

export default Account;
