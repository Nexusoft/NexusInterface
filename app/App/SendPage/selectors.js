import React from 'react';
import styled from '@emotion/styled';
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

const Address = styled.span(({ theme }) => ({
  color: theme.mixer(0.75),
}));

export const getRecipientSuggestions = memoize(addressBook => {
  const suggestions = [];
  if (addressBook) {
    addressBook.forEach(entry => {
      if (entry.notMine) {
        entry.notMine.forEach(a => {
          suggestions.push({
            name: entry.name,
            value: a.address,
            display: (
              <span>
                {entry.name} <Address>{a.address}</Address>
              </span>
            ),
          });
        });
      }
    });
  }
  return suggestions;
});

export const getRegisteredFieldNames = memoize(registeredFields =>
  Object.keys(registeredFields || {})
);
