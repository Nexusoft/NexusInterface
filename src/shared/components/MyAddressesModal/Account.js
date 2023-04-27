// External
import styled from '@emotion/styled';

// Internal
import Highlight from 'components/Highlight';
import NexusAddress from 'components/NexusAddress';
import highlightMatchingText from 'utils/highlightMatchingText';
import { formatNumber } from 'lib/intl';

__ = __context('MyAddresses');

const AccountComponent = styled.div(({ theme }) => ({
  padding: '1em 0',
  borderBottom: `1px solid ${theme.mixer(0.125)}`,
}));

const AccountName = styled.span({
  fontWeight: 'bold',
});

const Account = ({
  account: { account, balance, addresses = [] },
  searchQuery,
}) => (
  <AccountComponent>
    <div>
      Account{' '}
      <AccountName>
        {highlightMatchingText(account, searchQuery, Highlight)}
      </AccountName>{' '}
      ({formatNumber(balance, 6)} NXS)
    </div>
    {addresses.map((addr) => (
      <NexusAddress className="mt1" key={addr} address={addr} />
    ))}
  </AccountComponent>
);

export default Account;
