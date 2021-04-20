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

import Stat from './Stat';

__ = __context('Overview');

function CurrencyValue({ value, fiatCurrency, fiatDecimals, btcDecimals }) {
  if (typeof value !== 'number') {
    return <span className="dim">-</span>;
  }
  const decimals = fiatCurrency === 'BTC' ? btcDecimals : fiatDecimals;
  return formatCurrency(value, fiatCurrency, decimals);
}

export function PriceStat() {
  const fiatCurrency = useSelector((state) => state.settings.fiatCurrency);
  const price = useSelector((state) => state.market?.price);

  return (
    <Stat
      waitForCore={false}
      label={
        <>
          {__('Market Price')} ({fiatCurrency})
        </>
      }
      icon={chartIcon}
    >
      <CurrencyValue
        value={price}
        fiatCurrency={fiatCurrency}
        btcDecimals={8}
        fiatDecimals={2}
      />
    </Stat>
  );
}

export function MarketCapStat() {
  const fiatCurrency = useSelector((state) => state.settings.fiatCurrency);
  const marketCap = useSelector((state) => state.market?.marketCap);

  return (
    <Stat
      waitForCore={false}
      label={
        <>
          {__('Market Cap')} ({fiatCurrency})
        </>
      }
      icon={supplyIcon}
    >
      <CurrencyValue
        value={marketCap}
        fiatCurrency={fiatCurrency}
        btcDecimals={2}
        fiatDecimals={0}
      />
    </Stat>
  );
}

export function MarketCapStat() {
  const fiatCurrency = useSelector((state) => state.settings.fiatCurrency);
  const changePct24Hr = useSelector((state) => state.market?.changePct24Hr);

  return (
    <Stat
      waitForCore={false}
      label={
        <>
          {__('24hr Change')} ({fiatCurrency} %)
        </>
      }
      icon={hours24Icon}
    >
      {typeof changePct24Hr === 'number' ? (
        <>
          {changePct24Hr > 0 && '+'}
          {formatNumber(changePct24Hr, 2)}%
        </>
      ) : (
        <span className="dim">-</span>
      )}
    </Stat>
  );
}
