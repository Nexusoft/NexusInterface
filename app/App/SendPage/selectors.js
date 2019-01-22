import memoize from 'memoize-one';

function getAccountOptions(myAccounts) {
  if (myAccounts) {
    return myAccounts.map(acc => ({
      value: acc.account,
      display: `${acc.account} (${acc.balance} NXS)`,
    }));
  }
  return [];
}
getAccountOptions = memoize(getAccountOptions);
export { getAccountOptions };

function getNxsFiatPrice(rawNXSvalues, fiatCurrency) {
  if (rawNXSvalues) {
    const marketInfo = rawNXSvalues.find(e => e.name === fiatCurrency);
    if (marketInfo) {
      return marketInfo.price;
    }
  }
  return null;
}
getNxsFiatPrice = memoize(getNxsFiatPrice);
export { getNxsFiatPrice };
