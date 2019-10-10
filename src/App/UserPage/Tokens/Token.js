import React from 'react';
import styled from '@emotion/styled';

import Link from 'components/Link';
import NexusAddress from 'components/NexusAddress';
import { openModal } from 'lib/ui';

import TokenDetailsModal from './TokenDetailsModal';

const TokenComponent = styled.div(({ theme }) => ({
  padding: '1em 0',
  borderBottom: `1px solid ${theme.mixer(0.125)}`,
}));

const AccountName = styled.span(({ theme }) => ({
  fontWeight: 'bold',
  color: theme.foreground,
}));

const Owner = styled.span(({ theme }) => ({
  color: theme.mixer(0.75),
  fontWeight: '75%',
}));

const Token = ({ token, owner }) => (
  <TokenComponent>
    <div className="flex space-between">
      <div>
        <AccountName>{token.name}</AccountName>
        {owner === token.owner && <Owner>{__('(Owned by you)')}</Owner>}
      </div>
      <div>
        <Link
          as="a"
          onClick={() => {
            openModal(TokenDetailsModal, { token });
          }}
        >
          {__('Details')}
        </Link>
      </div>
    </div>
    <NexusAddress
      address={token.address || '00000000000000000000000000000000000000000000'}
    />
  </TokenComponent>
);

export default Token;
