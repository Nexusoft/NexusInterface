import React from 'react';
import styled from '@emotion/styled';
import memoize from 'utils/memoize';

export const getAccountOptions = memoize(myAccounts => {
  if (myAccounts) {
    return myAccounts.map(acc => ({
      value: acc.account,
      display: `${acc.account} (${acc.balance} NXS)`,
    }));
  }
  return [];
});

export const getAccountBalance = memoize((accountName, myAccounts) => {
  const account = myAccounts.find(acc => acc.account === accountName);
  return account && account.balance;
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
    Object.values(addressBook).forEach(contact => {
      if (contact.addresses) {
        contact.addresses.forEach(({ address, label }) => {
          map[address] = contact.name + (label ? ' - ' + label : '');
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
    Object.values(addressBook).forEach(contact => {
      if (contact.addresses) {
        contact.addresses.forEach(({ address, label, isMine }) => {
          if (!isMine) {
            suggestions.push({
              name: contact.name,
              value: address,
              display: (
                <span>
                  {contact.name}
                  {label ? ' - ' + label : ''} <Address>{address}</Address>
                </span>
              ),
            });
          }
        });
      }
    });
  }
  return suggestions;
});

export const getRegisteredFieldNames = memoize(registeredFields =>
  Object.keys(registeredFields || {})
);
