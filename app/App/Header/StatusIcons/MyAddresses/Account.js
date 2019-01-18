// External
import React from 'react';
import styled from '@emotion/styled';

// Internal
import Address from './Address';

const AccountComponent = styled.div(({ theme }) => ({
  padding: '1em 0',
  borderBottom: `1px solid ${theme.darkerGray}`,
}));

const AccountName = styled.span({
  fontWeight: 'bold',
});

const Account = ({ account: { account, addresses = [] } }) => (
  <AccountComponent>
    <div>
      Account <AccountName>{account}</AccountName>
    </div>
    {addresses.map(addr => (
      <Address key={addr} address={addr} />
    ))}
  </AccountComponent>
);

export default Account;
