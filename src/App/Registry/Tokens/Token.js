import styled from '@emotion/styled';

import Button from 'components/Button';
import NexusAddress from 'components/NexusAddress';
import { openModal } from 'lib/ui';

import TokenDetailsModal from './TokenDetailsModal';
import { RecordField, RecordLabel, RecordCreated } from '../RecordMetadata';

__ = __context('User.Tokens');

const TokenComponent = styled.div(({ theme }) => ({
  padding: 18,
  marginTop: 12,
  border: `1px solid ${theme.mixer(0.12)}`,
  borderRadius: 14,
  background: theme.mixer(0.025),
  overflowWrap: 'anywhere',
  '> .flex': { gap: 12, alignItems: 'center', flexWrap: 'wrap' },
}));

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
  fontSize: 11,
  display: 'inline-block',
  marginLeft: 8,
  padding: '4px 8px',
  borderRadius: 6,
  background: theme.mixer(0.07),
}));

export default function Token({ token, mine }) {
  return (
    <TokenComponent className="registry-record">
      <div className="flex space-between">
        <RecordField className="identity-field">
          <RecordLabel>{__('Token')}</RecordLabel>
          <span>
          <AccountName>{token.ticker}</AccountName>
          {!token.ticker && <UnNamed>{__('Unnamed token')}</UnNamed>}
          {mine && <Owner>{__(' (Owned by you)')}</Owner>}
          </span>
        </RecordField>
        <RecordCreated created={token.created} label={__('Created')} unavailable={__('Unavailable')} />
        <div>
          <Button
            skin="hyperlink"
            onClick={() => {
              openModal(TokenDetailsModal, {
                token: mine ? token : undefined,
                tokenAddress: mine ? undefined : token.address,
              });
            }}
          >
            {__('Details')}
          </Button>
        </div>
      </div>
      <div className="mt1">
        <RecordLabel>{__('Address')}</RecordLabel>
        <NexusAddress address={token.address} />
      </div>
    </TokenComponent>
  );
}
