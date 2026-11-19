import { ReactNode } from 'react';
import { Link } from 'react-router';
import { useAtomValue } from 'jotai';
import styled from '@emotion/styled';

import TokenName from 'components/TokenName';
import TransactionDetailsModal from 'components/TransactionDetailsModal';
import { formatNumber, formatCurrency, formatDateTime } from 'lib/intl';
import { marketDataQuery } from 'lib/market';
import { settingsAtom } from 'lib/settings';
import { balancesQuery } from 'lib/user';
import { stakeInfoQuery, loggedInAtom } from 'lib/session';
import { useCoreInfo, useCoreConnected, useSynchronized } from 'lib/coreInfo';
import {
  recentTransactionsQuery,
  getBalanceChanges,
} from 'lib/transactions';
import { openModal } from 'lib/ui';
import { Transaction } from 'lib/api';

__ = __context('Overview');

const DashboardPage = styled.div({
  width: '100%',
  height: '100%',
  overflowY: 'auto',
  padding: '20px 30px',
});

const Grid = styled.div({
  maxWidth: 980,
  margin: '0 auto',
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 3fr) minmax(0, 2fr)',
  gap: 16,
  '@media (max-width: 1050px)': {
    gridTemplateColumns: 'minmax(0, 1fr)',
  },
});

const Card = styled.section<{ wide?: boolean }>(
  ({ theme }) => ({
    background: theme.lower(theme.background, 0.2),
    border: `1px solid ${theme.mixer(0.125)}`,
    borderRadius: 4,
    padding: '16px 20px',
    minWidth: 0,
  }),
  ({ wide }) => wide && { gridColumn: '1 / -1' }
);

const CardTitle = styled.div(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'baseline',
  gap: 12,
  color: theme.primary,
  fontSize: 13,
  fontWeight: 'bold',
  textTransform: 'uppercase',
  letterSpacing: 0.5,
  marginBottom: 10,
}));

const CardLink = styled(Link)(({ theme }) => ({
  fontSize: 12,
  fontWeight: 'normal',
  textTransform: 'none',
  color: theme.mixer(0.75),
  '&:hover': { color: theme.foreground },
}));

const BigValue = styled.div(({ theme }) => ({
  fontSize: 32,
  color: theme.foreground,
  lineHeight: 1.2,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}));

const SubValue = styled.div(({ theme }) => ({
  color: theme.mixer(0.75),
  marginTop: 2,
}));

const Items = styled.div({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
  gap: '10px 16px',
  marginTop: 14,
});

const ItemLabel = styled.div(({ theme }) => ({
  fontSize: 12,
  color: theme.mixer(0.625),
  textTransform: 'uppercase',
}));

const ItemValue = styled.div(({ theme }) => ({
  color: theme.foreground,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}));

const StatusDot = styled.span<{ on?: boolean }>(({ on, theme }) => ({
  display: 'inline-block',
  width: 9,
  height: 9,
  borderRadius: '50%',
  marginRight: 8,
  background: on ? '#2dbd6e' : theme.mixer(0.375),
  boxShadow: on ? '0 0 6px #2dbd6e' : 'none',
}));

const TxRow = styled.div(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '110px minmax(0, 1fr) auto',
  gap: 12,
  alignItems: 'center',
  padding: '8px 4px',
  borderTop: `1px solid ${theme.mixer(0.075)}`,
  cursor: 'pointer',
  '&:hover': { background: theme.mixer(0.05) },
}));

const TxTime = styled.div(({ theme }) => ({
  fontSize: 13,
  color: theme.mixer(0.75),
  whiteSpace: 'nowrap',
}));

const TxOps = styled.div({
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

const TxAmount = styled.div<{ negative?: boolean }>(({ negative, theme }) => ({
  whiteSpace: 'nowrap',
  textAlign: 'right',
  color: negative ? theme.danger : theme.primary,
}));

const Empty = styled.div(({ theme }) => ({
  color: theme.mixer(0.625),
  padding: '6px 0',
}));

const txTimeFormat: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
};

function Item({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <div>
      <ItemLabel>{label}</ItemLabel>
      <ItemValue>{children}</ItemValue>
    </div>
  );
}

function BalanceCard() {
  const [nxsBalances, tokenBalances] = balancesQuery.use() || [];
  const marketData = marketDataQuery.use();
  const { hideOverviewBalances } = useAtomValue(settingsAtom);
  const hidden = (v: ReactNode) =>
    hideOverviewBalances ? <span className="dim">-</span> : v;

  const incoming =
    (nxsBalances?.unclaimed || 0) +
    (nxsBalances?.unconfirmed || 0) +
    (nxsBalances?.immature || 0);
  const total =
    (nxsBalances?.available || 0) + (nxsBalances?.stake || 0) + incoming;
  const { price, currency } = marketData || {};

  return (
    <Card>
      <CardTitle>
        <span>{__('Balance')}</span>
        <CardLink to="/Transactions">{__('Transactions')}</CardLink>
      </CardTitle>
      {nxsBalances ? (
        <>
          <BigValue>{hidden(`${formatNumber(total, 6)} NXS`)}</BigValue>
          <SubValue>
            {price && currency
              ? hidden(
                  formatCurrency(
                    total * price,
                    currency,
                    currency === 'BTC' ? 8 : 2
                  )
                )
              : null}
          </SubValue>
          <Items>
            <Item label={__('Available')}>
              {hidden(`${formatNumber(nxsBalances.available, 6)} NXS`)}
            </Item>
            <Item label={__('Staked')}>
              {hidden(`${formatNumber(nxsBalances.stake, 6)} NXS`)}
            </Item>
            <Item label={__('Incoming')}>
              {hidden(`${formatNumber(incoming, 6)} NXS`)}
            </Item>
            {!!tokenBalances?.length && (
              <Item label={__('Tokens')}>
                {hidden(
                  tokenBalances.slice(0, 2).map((balance) => (
                    <div key={balance.token}>
                      {formatNumber(balance.available, balance.decimals)}{' '}
                      <TokenName account={balance} />
                    </div>
                  ))
                )}
              </Item>
            )}
          </Items>
        </>
      ) : (
        <Empty>{__('Log in to see your balance')}</Empty>
      )}
    </Card>
  );
}

function StakingCard() {
  const stakeInfo = stakeInfoQuery.use();
  const coreInfo = useCoreInfo();
  const privateNet = coreInfo?.private;

  return (
    <Card>
      <CardTitle>
        <span>{__('Staking')}</span>
        <CardLink to="/User/Staking">{__('Open staking')}</CardLink>
      </CardTitle>
      {privateNet ? (
        <Empty>{__('Staking is not available in private network')}</Empty>
      ) : stakeInfo ? (
        <>
          <BigValue style={{ fontSize: 20 }}>
            <StatusDot on={stakeInfo.staking} />
            {stakeInfo.staking ? __('Staking') : __('Not staking')}
          </BigValue>
          <Items>
            <Item label={__('Stake rate')}>
              {formatNumber(stakeInfo.stakerate, 2)} %
            </Item>
            <Item label={__('Trust weight')}>
              {formatNumber(stakeInfo.trustweight, 2)} %
            </Item>
            <Item label={__('Block weight')}>
              {formatNumber(stakeInfo.blockweight, 2)} %
            </Item>
            <Item label={__('Stake weight')}>
              {formatNumber(stakeInfo.stakeweight, 2)} %
            </Item>
          </Items>
        </>
      ) : (
        <Empty>{__('No trust account yet')}</Empty>
      )}
    </Card>
  );
}

function NetworkCard() {
  const coreInfo = useCoreInfo();
  const coreConnected = useCoreConnected();
  const synchronized = useSynchronized();
  const marketData = marketDataQuery.use();
  const { price, currency, changePct24Hr } = marketData || {};

  return (
    <Card wide>
      <CardTitle>
        <span>{__('Network')}</span>
      </CardTitle>
      <Items style={{ marginTop: 0 }}>
        <Item label={__('Network')}>
          {!coreConnected
            ? __('Not connected')
            : coreInfo?.testnet
            ? __('Testnet %{number}', { number: coreInfo.testnet })
            : __('Mainnet')}
        </Item>
        <Item label={__('Sync')}>
          {!coreConnected
            ? '-'
            : synchronized
            ? __('Synced')
            : coreInfo?.syncing
            ? `${Math.floor(coreInfo.syncing.progress || 0)} %`
            : __('Syncing')}
        </Item>
        <Item label={__('Blocks')}>
          {typeof coreInfo?.blocks === 'number'
            ? formatNumber(coreInfo.blocks, 0)
            : '-'}
        </Item>
        <Item label={__('Connections')}>
          {typeof coreInfo?.connections === 'number'
            ? coreInfo.connections
            : '-'}
        </Item>
        <Item label={__('NXS price')}>
          {price && currency
            ? formatCurrency(price, currency, currency === 'BTC' ? 8 : 4)
            : '-'}
          {typeof changePct24Hr === 'number' && (
            <span
              className="ml0_4"
              style={{ color: changePct24Hr < 0 ? '#e05a47' : '#2dbd6e' }}
            >
              {changePct24Hr > 0 ? '+' : ''}
              {formatNumber(changePct24Hr, 2)} %
            </span>
          )}
        </Item>
      </Items>
    </Card>
  );
}

function RecentTransaction({ tx }: { tx: Transaction }) {
  const changes = getBalanceChanges(tx);
  const ops = [...new Set((tx.contracts || []).map((c) => c.OP))].join(', ');
  return (
    <TxRow
      onClick={() => openModal(TransactionDetailsModal, { txid: tx.txid })}
      style={{ opacity: tx.confirmations ? 1 : 0.6 }}
    >
      <TxTime>{formatDateTime(tx.timestamp * 1000, txTimeFormat)}</TxTime>
      <TxOps>{ops}</TxOps>
      <div>
        {changes.map((change) => (
          <TxAmount key={change.token} negative={change.amount < 0}>
            {change.amount > 0 ? '+' : ''}
            {formatNumber(change.amount, 6)}{' '}
            <TokenName contract={change} />
          </TxAmount>
        ))}
      </div>
    </TxRow>
  );
}

function RecentTransactionsCard() {
  const transactions = recentTransactionsQuery.use();
  const loggedIn = useAtomValue(loggedInAtom);
  return (
    <Card wide>
      <CardTitle>
        <span>{__('Recent transactions')}</span>
        <CardLink to="/Transactions">{__('All transactions')}</CardLink>
      </CardTitle>
      {!loggedIn ? (
        <Empty>{__('Log in to see your transactions')}</Empty>
      ) : !transactions ? (
        <Empty>{__('Loading transactions...')}</Empty>
      ) : transactions.length === 0 ? (
        <Empty>{__('No transactions yet')}</Empty>
      ) : (
        transactions.map((tx) => <RecentTransaction key={tx.txid} tx={tx} />)
      )}
    </Card>
  );
}

export default function Dashboard() {
  return (
    <DashboardPage>
      <Grid>
        <BalanceCard />
        <StakingCard />
        <NetworkCard />
        <RecentTransactionsCard />
      </Grid>
    </DashboardPage>
  );
}
