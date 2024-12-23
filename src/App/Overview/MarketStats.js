// External
import { useAtomValue } from 'jotai';

// Internal
import { formatNumber, formatCurrency } from 'lib/intl';
import { marketDataAtom, marketCapAtom } from 'lib/market';

// Images
import chartIcon from 'icons/chart.svg';
import supplyIcon from 'icons/supply.svg';
import hours24Icon from 'icons/24hr.svg';

import Stat from './Stat';

__ = __context('Overview');

function CurrencyValue({ value, currency, fiatDecimals, btcDecimals }) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return <span className="dim">-</span>;
  }
  const decimals = currency === 'BTC' ? btcDecimals : fiatDecimals;
  return formatCurrency(value, currency, decimals);
}

export function PriceStat() {
  const marketData = useAtomValue(marketDataAtom);
  const { price, currency } = marketData || {};

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
  const marketData = useAtomValue(marketDataAtom);
  const marketCap = useAtomValue(marketCapAtom);
  const { currency } = marketData || {};

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
  const marketData = useAtomValue(marketDataAtom);
  const { changePct24Hr, currency } = marketData || {};

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
