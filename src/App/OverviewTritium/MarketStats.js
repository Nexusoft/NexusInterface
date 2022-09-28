// External
import { useSelector } from 'react-redux';

// Internal
import { formatNumber, formatCurrency } from 'lib/intl';

// Images
import chartIcon from 'icons/chart.svg';
import supplyIcon from 'icons/supply.svg';
import hours24Icon from 'icons/24hr.svg';

import Stat from './Stat';

__ = __context('Overview');

function CurrencyValue({ value, currency, fiatDecimals, btcDecimals }) {
  if (typeof value !== 'number') {
    return <span className="dim">-</span>;
  }
  const decimals = currency === 'BTC' ? btcDecimals : fiatDecimals;
  return formatCurrency(value, currency, decimals);
}

export function PriceStat() {
  const price = useSelector((state) => state.market?.price);
  const currency = useSelector((state) => state.market?.currency);

  return (
    <Stat
      waitForCore={false}
      label={
        <>
          {__('Market Price')} ({currency})
        </>
      }
      icon={chartIcon}
    >
      <CurrencyValue
        value={price}
        currency={currency}
        btcDecimals={8}
        fiatDecimals={3}
      />
    </Stat>
  );
}

export function MarketCapStat() {
  const marketCap = useSelector((state) => state.market?.marketCap);
  const currency = useSelector((state) => state.market?.currency);

  return (
    <Stat
      waitForCore={false}
      label={
        <>
          {__('Market Cap')} ({currency})
        </>
      }
      icon={supplyIcon}
    >
      <CurrencyValue
        value={marketCap}
        currency={currency}
        btcDecimals={2}
        fiatDecimals={0}
      />
    </Stat>
  );
}

export function PctChangeStat() {
  const changePct24Hr = useSelector((state) => state.market?.changePct24Hr);
  const currency = useSelector((state) => state.market?.currency);

  return (
    <Stat
      waitForCore={false}
      label={
        <>
          {__('24hr Change')} ({currency} %)
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
