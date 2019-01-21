import React from 'react';
import Text from 'components/Text';

export function getAccountOptions(myAccounts) {
  if (myAccounts) {
    return [
      { value: '', display: <Text id="sendReceive.SelectAnAccount" /> },
      ...myAccounts.map(acc => ({
        value: acc.account,
        display: `${acc.account} (${acc.balance} NXS)`,
      })),
    ];
  }
  return [];
}

export function getNxsFiatPrice(rawNXSvalues, fiatCurrency) {
  if (rawNXSvalues) {
    const marketInfo = rawNXSvalues.find(e => e.name === fiatCurrency);
    if (marketInfo) {
      return marketInfo.price;
    }
  }
  return null;
}
