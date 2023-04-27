import styled from '@emotion/styled';

import Link from 'components/Link';
import NexusAddress from 'components/NexusAddress';
import { openModal } from 'lib/ui';

import TokenDetailsModal from './TokenDetailsModal';

__ = __context('User.Tokens');

const TokenComponent = styled.div({
  padding: '1em 0 1.5em',
});

const AccountName = styled.span(({ theme }) => ({
  fontWeight: 'bold',
  color: theme.foreground,
}));

const UnNamed = styled(AccountName)(({ theme }) => ({
  fontStyle: 'italic',
  color: theme.mixer(0.8),
}));

const Owner = styled.span(({ theme }) => ({
  color: theme.mixer(0.75),
  fontWeight: '75%',
}));

export default function Token({ token, mine }) {
  return (
    <TokenComponent>
      <div className="flex space-between">
        <div>
          <AccountName>{token.ticker}</AccountName>
          {!token.ticker && <UnNamed>{__('Unnamed token')}</UnNamed>}
          {mine && <Owner>{__(' (Owned by you)')}</Owner>}
        </div>
        <div>
          <Link
            as="a"
            onClick={() => {
              openModal(TokenDetailsModal, {
                token: mine ? token : undefined,
                tokenAddress: mine ? undefined : token.address,
              });
            }}
          >
            {__('Details')}
          </Link>
        </div>
      </div>
      <NexusAddress className="mt1" address={token.address} />
    </TokenComponent>
  );
}
