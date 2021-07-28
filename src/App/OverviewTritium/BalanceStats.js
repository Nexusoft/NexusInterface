// External
import { useSelector } from 'react-redux';

// Internal
import Icon from 'components/Icon';
import Tooltip from 'components/Tooltip';
import TokenName from 'components/TokenName';
import QuestionCircle from 'components/QuestionCircle';
import { formatNumber, formatCurrency } from 'lib/intl';
import { isSynchronized, selectTokenBalances } from 'selectors';

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
      {tokenBalances.map((token) => (
        <div key={token.address}>
          {formatNumber(token.balance, token.decimals)}{' '}
          <TokenName token={token} />
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
  const hideOverviewBalances = useSelector(
    (state) => state.settings.hideOverviewBalances
  );

  if (hideOverviewBalances) {
    return blank;
  }
  return children;
}

export function NXSBalanceStat() {
  const tokenBalances = useSelector(selectTokenBalances);
  const synchronized = useSelector(isSynchronized);
  const balances = useSelector((state) => state.user.balances).filter(e => e.ticker === 'NXS')[0];
  const hideOverviewBalances = useSelector(
    (state) => state.settings.hideOverviewBalances
  );

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
          {!synchronized && balances && <UnsyncWarning />}
          <span className="v-align">
            {__('Balance')}
            {tokenBalances?.length === 0 && ' (NXS)'}
          </span>
        </>
      }
      icon={logoIcon}
    >
      <BalanceValue>
        {balances ? (
          <div>
            <div>
              {formatNumber(balances?.available + balances?.stake)}
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
  const fiatCurrency = useSelector((state) => state.settings.fiatCurrency);
  const balances = useSelector((state) => state.user.balances).filter(e => e.ticker === 'NXS')[0];;
  const price = useSelector((state) => state.market?.price);

  return (
    <Stat
      linkTo="/Transactions"
      label={
        <>
          {__('NXS Balance')} ({fiatCurrency})
        </>
      }
      icon={currencyIcons(fiatCurrency)}
    >
      <BalanceValue>
        {price && balances
          ? formatCurrency(
              (balances?.available + balances?.stake) * price,
              fiatCurrency
            )
          : blank}
      </BalanceValue>
    </Stat>
  );
}

export function FeaturedTokenBalanceStat() {
  const theme = useSelector((state) => state.theme);
  const tokenBalances = useSelector(selectTokenBalances);
  const featuredToken = theme.featuredTokenName
    ? tokenBalances?.find((token) => token.name === theme.featuredTokenName)
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
  const balances = useSelector((state) => state.user.balances).filter(e => e.ticker === 'NXS')[0];;
  const incoming =
    balances?.unclaimed + balances?.unconfirmed + balances?.immature;

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
      <BalanceValue>{balances ? formatNumber(incoming) : blank}</BalanceValue>
    </Stat>
  );
}
