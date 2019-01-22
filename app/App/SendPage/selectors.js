import memoize from 'memoize-one';

export const getAccountOptions = memoize(myAccounts => {
  if (myAccounts) {
    return myAccounts.map(acc => ({
      value: acc.account,
      display: `${acc.account} (${acc.balance} NXS)`,
    }));
  }
  return [];
});

export const getNxsFiatPrice = memoize((rawNXSvalues, fiatCurrency) => {
  if (rawNXSvalues) {
    const marketInfo = rawNXSvalues.find(e => e.name === fiatCurrency);
    if (marketInfo) {
      return marketInfo.price;
    }
  }
  return null;
});

export const getAddressNameMap = memoize(addressBook => {
  const map = {};
  if (addressBook) {
    addressBook.forEach(entry => {
      if (entry.notMine) {
        entry.notMine.forEach(a => {
          map[a.address] = entry.name;
        });
      }
    });
  }
  return map;
});

export const getRecipientSuggestions = memoize(addressBook =>
  addressBook.flatMap(entry =>
    entry.notMine.map(a => `${entry.name}: ${a.address}`)
  )
);
