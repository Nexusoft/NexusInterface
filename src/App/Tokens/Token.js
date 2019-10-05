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

const Token = ({ token }) => (
  <TokenComponent>
    <div className="flex space-between">
      <div>
        <AccountName>{token.name}</AccountName>
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
      address={'000000000000000000000000000000000' /*token.address*/}
    />
  </TokenComponent>
);

export default Token;
