import React from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

import Link from 'components/Link';
import NexusAddress from 'components/NexusAddress';
import { formatNumber } from 'lib/intl';
import { openModal } from 'actions/overlays';

import AccountDetailsModal from './AccountDetailsModal';
import { totalBalance } from './utils';

const AccountComponent = styled.div(({ theme }) => ({
  padding: '1em 0',
  borderBottom: `1px solid ${theme.mixer(0.125)}`,
}));

const AccountName = styled.span(({ theme }) => ({
  fontWeight: 'bold',
  color: theme.foreground,
}));

const Account = ({ account, openModal }) => (
  <AccountComponent>
    <div className="flex space-between">
      <div>
        <AccountName>{account.name}</AccountName> (
        {formatNumber(totalBalance(account), 20)} {account.token_name})
      </div>
      <Link
        as="a"
        href="javascript:;"
        onClick={() => {
          openModal(AccountDetailsModal, { account });
        }}
      >
        {__('Details')}
      </Link>
    </div>
    <NexusAddress address={account.address} />
  </AccountComponent>
);

const actionCreators = {
  openModal,
};

export default connect(
  null,
  actionCreators
)(Account);
