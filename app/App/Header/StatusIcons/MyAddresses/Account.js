// External
import React from 'react';
import styled from '@emotion/styled';

// Internal
import Highlight from 'components/Highlight';
import { highlightMatchingText } from 'utils';
import Address from './Address';

const AccountComponent = styled.div(({ theme }) => ({
  padding: '1em 0',
  borderBottom: `1px solid ${theme.mixer(0.125)}`,
}));

const AccountName = styled.span({
  fontWeight: 'bold',
});

const Account = ({ account: { account, addresses = [] }, searchQuery }) => (
  <AccountComponent>
    <div>
      Account{' '}
      <AccountName>
        {highlightMatchingText(account, searchQuery, Highlight)}
      </AccountName>
    </div>
    {addresses.map(addr => (
      <Address key={addr} address={addr} />
    ))}
  </AccountComponent>
);

export default Account;
