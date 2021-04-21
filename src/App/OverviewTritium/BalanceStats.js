// External
import { Fragment, Component } from 'react';
import { Link } from 'react-router-dom';
import { connect, useSelector } from 'react-redux';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import GA from 'lib/googleAnalytics';

// Internal
import Icon from 'components/Icon';
import Tooltip from 'components/Tooltip';
import TokenName from 'components/TokenName';
import QuestionCircle from 'components/QuestionCircle';
import { refreshBalances, loadAccounts } from 'lib/user';
import { getMiningInfo } from 'lib/core';
import { formatNumber, formatCurrency, formatRelativeTime } from 'lib/intl';
import { timing, consts } from 'styles';
import {
  isCoreConnected,
  isSynchronized,
  selectTokenBalances,
} from 'selectors';
import { observeStore } from 'store';
import Globe from './Globe';
import { webGLAvailable } from 'consts/misc';

// Images
import logoIcon from 'icons/NXS_coin.svg';
import currencyIcons from 'data/currencyIcons';
import chartIcon from 'icons/chart.svg';
import supplyIcon from 'icons/supply.svg';
import hours24Icon from 'icons/24hr.svg';
import nxsStakeIcon from 'icons/nxs-staking.svg';
import Connections0 from 'icons/Connections0.svg';
import Connections4 from 'icons/Connections4.svg';
import Connections8 from 'icons/Connections8.svg';
import Connections12 from 'icons/Connections12.svg';
import Connections14 from 'icons/Connections14.svg';
import Connections16 from 'icons/Connections16.svg';
import blockweight0 from 'icons/BlockWeight-0.svg';
import blockweight1 from 'icons/BlockWeight-1.svg';
import blockweight2 from 'icons/BlockWeight-2.svg';
import blockweight3 from 'icons/BlockWeight-3.svg';
import blockweight4 from 'icons/BlockWeight-4.svg';
import blockweight5 from 'icons/BlockWeight-5.svg';
import blockweight6 from 'icons/BlockWeight-6.svg';
import blockweight7 from 'icons/BlockWeight-7.svg';
import blockweight8 from 'icons/BlockWeight-8.svg';
import blockweight9 from 'icons/BlockWeight-9.svg';
import trust00 from 'icons/trust00.svg';
import trust10 from 'icons/trust00.svg';
import trust20 from 'icons/trust00.svg';
import trust30 from 'icons/trust00.svg';
import trust40 from 'icons/trust00.svg';
import trust50 from 'icons/trust00.svg';
import trust60 from 'icons/trust00.svg';
import trust70 from 'icons/trust00.svg';
import trust80 from 'icons/trust00.svg';
import trust90 from 'icons/trust00.svg';
import trust100 from 'icons/trust00.svg';
import nxsblocksIcon from 'icons/blockexplorer-invert-white.svg';
import interestIcon from 'icons/interest.svg';
import stakeIcon from 'icons/staking-white.svg';
import warningIcon from 'icons/warning.svg';
import questionMarkCircleIcon from 'icons/question-mark-circle.svg';

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

function BalanceValue({ children }) {
  const hideOverviewBalances = useSelector(
    (state) => state.settings.hideOverviewBalances
  );

  if (hideOverviewBalances) {
    return <span className="dim">-</span>;
  }
  return children;
}

export function NXSBalanceStat() {
  const tokenBalances = useSelector(selectTokenBalances);
  const synchronized = useSelector(isSynchronized);
  const { available, stake } = useSelector((state) => state.user.balances);

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
          {!synchronized && available !== undefined && <UnsyncWarning />}
          <span className="v-align">
            {__('Balance')}
            {tokenBalances?.length === 0 && ' (NXS)'}
          </span>
        </>
      }
      icon={logoIcon}
    >
      <BalanceValue>
        {available !== undefined ? (
          <div>
            <div>
              {formatNumber(available + stake)}
              {tokenBalances?.length > 0 && ' NXS'}
            </div>
            {tokenBalances?.length > 0 && (
              <SubValue>+ {__('OTHER TOKENS')}</SubValue>
            )}
          </div>
        ) : (
          'N/A'
        )}
      </BalanceValue>
    </Stat>
  );
}

export function NXSFiatBalanceStat() {
  const fiatCurrency = useSelector((state) => state.settings.fiatCurrency);
  const { available, stake } = useSelector((state) => state.user.balances);

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
        {available !== undefined
          ? formatCurrency((available + stake) * market.price, fiatCurrency)
          : 'N/A'}
      </BalanceValue>
    </Stat>
  );
}

export function FeaturedTokenBalanceStat() {
  const theme = useSelector((state) => state.theme);

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
          : 'N/A'}
      </BalanceValue>
    </Stat>
  );
}

export function IncomingBalanceStat() {
  const { pending, unconfirmed, immature } = useSelector(
    (state) => state.user.balances
  );
  const incoming = pending + unconfirmed + immature;

  return (
    <Stat
      linkTo="/Transactions"
      label={
        <>
          <QuestionCircle
            tooltip={__(
              'This includes your pending balance, unconfirmed balance and immature balance'
            )}
            align="start"
          />{' '}
          <span className="v-align">{__('Incoming balances')} (NXS)</span>
        </>
      }
      icon={nxsStakeIcon}
    >
      <BalanceValue>
        {Number.isNaN(incoming) ? formatNumber(incoming) : 'N/A'}
      </BalanceValue>
    </Stat>
  );
}
