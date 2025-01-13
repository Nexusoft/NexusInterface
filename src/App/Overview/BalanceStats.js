// External
import { useSelector } from 'react-redux';
import { useAtomValue } from 'jotai';

// Internal
import Icon from 'components/Icon';
import Tooltip from 'components/Tooltip';
import TokenName from 'components/TokenName';
import QuestionCircle from 'components/QuestionCircle';
import { formatNumber, formatCurrency } from 'lib/intl';
import { marketDataAtom } from 'lib/market';
import { settingAtoms } from 'lib/settings';
import { balancesQuery } from 'lib/user';
import { useSynchronized } from 'lib/coreInfo';

// Images
import logoIcon from 'icons/NXS_coin.svg';
import currencyIcons from 'data/currencyIcons';
import warningIcon from 'icons/warning.svg';
import waitIcon from 'icons/wait.svg';

import Stat from './Stat';

__ = __context('Overview');

function TokenBalancesTooltip({ tokenBalances }) {
  return (
    <div style={{ textAlign: 'right' }}>
      <div>{__('Token balances')}</div>
      {tokenBalances.map((balance) => (
        <div key={balance.token}>
          {formatNumber(balance.available, balance.decimals)}{' '}
          <TokenName account={balance} />
        </div>
      ))}
    </div>
  );
}

function UnsyncWarning() {
  return (
    <Tooltip.Trigger
      align="start"
      tooltip={__(
        'The balance displayed might not be up-to-date since the wallet is not yet fully synchronized'
      )}
    >
      <Icon icon={warningIcon} className="mr0_4" />
    </Tooltip.Trigger>
  );
}

const blank = <span className="dim">-</span>;

function BalanceValue({ children }) {
  const hideOverviewBalances = useAtomValue(settingAtoms.hideOverviewBalances);

  if (hideOverviewBalances) {
    return blank;
  }
  return children;
}

export function NXSBalanceStat() {
  const [nxsBalances, tokenBalances] = balancesQuery.use();
  const synchronized = useSynchronized();
  const hideOverviewBalances = useAtomValue(settingAtoms.hideOverviewBalances);

  return (
    <Stat
      tooltipAlign="end"
      tooltip={
        tokenBalances?.length > 0 &&
        !hideOverviewBalances && (
          <TokenBalancesTooltip tokenBalances={tokenBalances} />
        )
      }
      linkTo="/Transactions"
      label={
        <>
          {!synchronized && nxsBalances && <UnsyncWarning />}
          <span className="v-align">
            {__('Balance')}
            {tokenBalances?.length === 0 && ' (NXS)'}
          </span>
        </>
      }
      icon={logoIcon}
    >
      <BalanceValue>
        {nxsBalances ? (
          <div>
            <div>
              {formatNumber(nxsBalances.available + nxsBalances.stake)}
              {tokenBalances?.length > 0 && ' NXS'}
            </div>
            {tokenBalances?.length > 0 && (
              <div style={{ fontSize: '0.4em' }}>+ {__('OTHER TOKENS')}</div>
            )}
          </div>
        ) : (
          blank
        )}
      </BalanceValue>
    </Stat>
  );
}

export function NXSFiatBalanceStat() {
  const [nxsBalances] = balancesQuery.use();
  const marketData = useAtomValue(marketDataAtom);
  const { price, currency } = marketData || {};

  return (
    <Stat
      linkTo="/Transactions"
      label={
        <>
          {__('NXS Balance')} ({currency})
        </>
      }
      icon={currencyIcons(currency)}
    >
      <BalanceValue>
        {price && nxsBalances
          ? formatCurrency(
              (nxsBalances.available + nxsBalances.stake) * price,
              currency
            )
          : blank}
      </BalanceValue>
    </Stat>
  );
}

export function FeaturedTokenBalanceStat() {
  const theme = useSelector((state) => state.theme);
  const [nxsBalances, tokenBalances] = balancesQuery.use();
  const featuredToken = theme.featuredTokenName
    ? tokenBalances?.find((token) => token.ticker === theme.featuredTokenName)
    : undefined;

  return (
    <Stat
      linkTo="/Transactions"
      label={__('%{token_name} balance', {
        token_name: theme.featuredTokenName,
      })}
      icon={logoIcon}
    >
      <BalanceValue>
        {featuredToken
          ? formatNumber(featuredToken.balance, featuredToken.decimals)
          : blank}
      </BalanceValue>
    </Stat>
  );
}

export function IncomingBalanceStat() {
  const [nxsBalances] = balancesQuery.use();
  const incoming =
    nxsBalances?.unclaimed + nxsBalances?.unconfirmed + nxsBalances?.immature;

  return (
    <Stat
      linkTo="/Transactions"
      label={
        <>
          <QuestionCircle
            tooltip={__(
              'This includes your unclaimed balance, unconfirmed balance and immature balance'
            )}
            align="start"
          />{' '}
          <span className="v-align">{__('Incoming balances')} (NXS)</span>
        </>
      }
      icon={waitIcon}
    >
      <BalanceValue>
        {nxsBalances ? formatNumber(incoming) : blank}
      </BalanceValue>
    </Stat>
  );
}
