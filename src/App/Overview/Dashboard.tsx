import { ReactNode } from 'react';
import { Link } from 'react-router';
import { useAtomValue } from 'jotai';
import styled from '@emotion/styled';

import TokenName from 'components/TokenName';
import Icon from 'components/Icon';
import Tooltip from 'components/Tooltip';
import geoip from 'data/geoip';
import visibleIcon from 'icons/visible.svg';
import invisibleIcon from 'icons/invisible.svg';
import TransactionDetailsModal from 'components/TransactionDetailsModal';
import { formatNumber, formatCurrency, formatDateTime } from 'lib/intl';
import { marketDataQuery } from 'lib/market';
import { settingsAtom, updateSettings } from 'lib/settings';
import { stakeRewardsQuery } from 'lib/staking';
import { balancesQuery } from 'lib/user';
import { stakeInfoQuery, loggedInAtom } from 'lib/session';
import {
  useCoreInfo,
  useCoreConnected,
  useSynchronized,
  peersQuery,
} from 'lib/coreInfo';
import {
  recentTransactionsQuery,
  getBalanceChanges,
  getDeltaSign,
} from 'lib/transactions';
import { openModal } from 'lib/ui';
import { Transaction } from 'lib/api';

__ = __context('Overview');

const DashboardPage = styled.div({
  width: '100%',
  height: '100%',
  overflowY: 'auto',
  //room for the status line under the header (not logged in, staking warning)
  padding: '36px 30px 20px',
});

const Grid = styled.div({
  maxWidth: 980,
  margin: '0 auto',
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 3fr) minmax(0, 2fr)',
  gridTemplateAreas: '"balance staking" "recent network"',
  alignItems: 'start',
  gap: 16,
  '@media (max-width: 1050px)': {
    gridTemplateColumns: 'minmax(0, 1fr)',
    gridTemplateAreas: '"balance" "staking" "recent" "network"',
  },
});

const Card = styled.section<{ wide?: boolean; area?: string }>(
  ({ area }) => (area ? { gridArea: area } : {}),
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

const EyeButton = styled.span(({ theme }) => ({
  cursor: 'pointer',
  fontSize: 15,
  color: theme.mixer(0.625),
  '&:hover': { color: theme.foreground },
}));

const timeAgo = (seconds: number) => {
  const minutes = Math.max(0, Math.floor((Date.now() / 1000 - seconds) / 60));
  if (minutes < 60)
    return __('%{smart_count} minute ago |||| %{smart_count} minutes ago', minutes);
  const hours = Math.floor(minutes / 60);
  if (hours < 48)
    return __('%{smart_count} hour ago |||| %{smart_count} hours ago', hours);
  return __('%{smart_count} day ago |||| %{smart_count} days ago', Math.floor(hours / 24));
};

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

const Rows = styled.div({
  display: 'grid',
  gridTemplateColumns: 'auto minmax(0, 1fr)',
  rowGap: 8,
  columnGap: 16,
  alignItems: 'baseline',
});

const RowLabel = styled.div(({ theme }) => ({
  fontSize: 12,
  color: theme.mixer(0.625),
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
}));

const RowValue = styled.div(({ theme }) => ({
  color: theme.foreground,
  textAlign: 'right',
  minWidth: 0,
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

function Row({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <>
      <RowLabel>{label}</RowLabel>
      <RowValue>{children}</RowValue>
    </>
  );
}

function Item({
  label,
  children,
  wrap,
}: {
  label: ReactNode;
  children: ReactNode;
  wrap?: boolean;
}) {
  return (
    <div>
      <ItemLabel>{label}</ItemLabel>
      <ItemValue style={wrap ? { whiteSpace: 'normal' } : undefined}>
        {children}
      </ItemValue>
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
    <Card area="balance">
      <CardTitle>
        <span>
          {__('Balance')}{' '}
          <Tooltip.Trigger
            tooltip={hideOverviewBalances ? __('Show balances') : __('Hide balances')}
          >
            <EyeButton
              onClick={() =>
                updateSettings({ hideOverviewBalances: !hideOverviewBalances })
              }
            >
              <Icon icon={hideOverviewBalances ? invisibleIcon : visibleIcon} />
            </EyeButton>
          </Tooltip.Trigger>
        </span>
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
  const rewards = stakeRewardsQuery.use();
  const loggedIn = useAtomValue(loggedInAtom);
  const lastReward = rewards?.[0];
  const lastRewardAmount = lastReward
    ? getBalanceChanges(lastReward).reduce((sum, c) => sum + (c.amount || 0), 0)
    : 0;
  const { hideOverviewBalances } = useAtomValue(settingsAtom);
  const coreInfo = useCoreInfo();
  const privateNet = coreInfo?.private;

  return (
    <Card area="staking">
      <CardTitle>
        <span>{__('Staking')}</span>
        <CardLink to="/User/Staking">{__('Open staking')}</CardLink>
      </CardTitle>
      {!loggedIn ? (
        <Empty>{__('Log in to see your staking')}</Empty>
      ) : privateNet ? (
        <Empty>{__('Staking is not available in private network')}</Empty>
      ) : stakeInfo ? (
        <>
          <BigValue style={{ fontSize: 20 }}>
            <StatusDot on={stakeInfo.staking} />
            {stakeInfo.staking ? __('Staking') : __('Not staking')}
          </BigValue>
          <Items>
            <Item label={__('Staked')}>
              {hideOverviewBalances ? '-' : `${formatNumber(stakeInfo.stake, 2)} NXS`}
            </Item>
            <Item label={__('Last reward')}>
              {lastReward ? (
                <Tooltip.Trigger tooltip={`+${formatNumber(lastRewardAmount, 6)} NXS`}>
                  <span>{timeAgo(lastReward.timestamp)}</span>
                </Tooltip.Trigger>
              ) : (
                '-'
              )}
            </Item>
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
  //vertical list in the right column, under staking
  const coreInfo = useCoreInfo();
  const peers = peersQuery.use();
  const countries = new Set(
    (peers || [])
      .map((peer) => (geoip.get(peer.address.split(':')[0]) as any)?.country?.iso_code)
      .filter(Boolean)
  ).size;
  const coreConnected = useCoreConnected();
  const synchronized = useSynchronized();
  const marketData = marketDataQuery.use();
  const { price, currency, changePct24Hr } = marketData || {};

  return (
    <Card area="network">
      <CardTitle>
        <span>{__('Network')}</span>
      </CardTitle>
      <Rows>
        <Row label={__('Network')}>
          {!coreConnected
            ? __('Not connected')
            : coreInfo?.testnet
            ? __('Testnet %{number}', { number: coreInfo.testnet })
            : __('Mainnet')}
        </Row>
        <Row label={__('Sync')}>
          {!coreConnected
            ? '-'
            : synchronized
            ? __('Synced')
            : coreInfo?.syncing
            ? `${Math.floor(coreInfo.syncing.progress || 0)} %`
            : __('Syncing')}
        </Row>
        <Row label={__('Blocks')}>
          {typeof coreInfo?.blocks === 'number'
            ? formatNumber(coreInfo.blocks, 0)
            : '-'}
        </Row>
        <Row label={__('Connections')}>
          {typeof coreInfo?.connections === 'number'
            ? coreInfo.connections
            : '-'}
        </Row>
        <Row label={__('Nodes')}>
          {peers
            ? countries
              ? __('%{nodes} in %{smart_count} country |||| %{nodes} in %{smart_count} countries', {
                  smart_count: countries,
                  nodes: peers.length,
                })
              : peers.length
            : '-'}
        </Row>
        <Row label={__('NXS price')}>
          {price && currency
            ? formatCurrency(price, currency, currency === 'BTC' ? 8 : 4)
            : '-'}
          {typeof changePct24Hr === 'number' && (
            <span
              className="ml0_4"
              style={{
                color: changePct24Hr < 0 ? '#e05a47' : '#2dbd6e',
                whiteSpace: 'nowrap',
              }}
            >
              {changePct24Hr > 0 ? '+' : ''}
              {formatNumber(changePct24Hr, 2)} %
            </span>
          )}
        </Row>
      </Rows>
    </Card>
  );
}

const shortAddress = (address: string) =>
  address.length > 16 ? `${address.slice(0, 6)}...${address.slice(-4)}` : address;

const registerLabel = (register: any) => {
  if (!register) return null;
  if (typeof register === 'string') return shortAddress(register);
  if (register.name) {
    if (register.namespace) return `${register.namespace}::${register.name}`;
    if (!register.global && register.user) return `${register.user}:${register.name}`;
    return register.name;
  }
  return register.address ? shortAddress(register.address) : null;
};

//the other side of the first payment in the transaction
function counterpart(tx: Transaction) {
  for (const contract of (tx.contracts || []) as any[]) {
    const sign = getDeltaSign(contract);
    if (sign === '-' && contract.to) {
      const label = registerLabel(contract.to);
      if (label) return __('to %{name}', { name: label });
    }
    if (sign === '+' && contract.from) {
      const label = registerLabel(contract.from);
      if (label) return __('from %{name}', { name: label });
    }
  }
  return null;
}

function RecentTransaction({ tx }: { tx: Transaction }) {
  const changes = getBalanceChanges(tx);
  const ops = [...new Set((tx.contracts || []).map((c) => c.OP))].join(', ');
  const other = counterpart(tx);
  return (
    <TxRow
      onClick={() => openModal(TransactionDetailsModal, { txid: tx.txid })}
      style={{ opacity: tx.confirmations ? 1 : 0.6 }}
    >
      <TxTime>{formatDateTime(tx.timestamp * 1000, txTimeFormat)}</TxTime>
      <TxOps>
        {ops}
        {!!other && <span className="dim"> {other}</span>}
      </TxOps>
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
    <Card area="recent">
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
