import React from 'react';
import styled from '@emotion/styled';

import Link from 'components/Link';
import NexusAddress from 'components/NexusAddress';
import { formatNumber } from 'lib/intl';
import { openModal } from 'lib/ui';

import AccountDetailsModal from './AccountDetailsModal';
import AccountHistoryModal from './AccountHistoryModal';
import { totalBalance } from './utils';

const AccountComponent = styled.div(({ theme }) => ({
  padding: '1em 0',
  borderBottom: `1px solid ${theme.mixer(0.125)}`,
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
        {!account.name && <UnNamed>{__('Account')}</UnNamed>}
        <AccountName>{account.name}</AccountName> (
        {formatNumber(totalBalance(account))} {account.token_name || 'Tokens'})
      </div>
      <div>
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
    <NexusAddress address={account.address} />
  </AccountComponent>
);

export default Account;
