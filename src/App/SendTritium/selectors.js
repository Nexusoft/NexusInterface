import React from 'react';
import styled from '@emotion/styled';
import memoize from 'utils/memoize';

const TokenRecipientName = styled.span({
  color: 'gray',
});

export const getAccountOptions = memoize(myAccounts => {
  if (myAccounts) {
    return myAccounts.map(acc => ({
      value: acc.name,
      display: `${acc.name} (${acc.balance} ${acc.token_name || 'Tokens'})`,
    }));
  }
  return [];
});

export const getAccountBalance = memoize((accountName, myAccounts) => {
  const account =
    myAccounts && myAccounts.find(acc => acc.name === accountName);
  return account && account.balance;
});

export const getAccountInfo = memoize((accountName, myAccounts) => {
  const account =
    myAccounts && myAccounts.find(acc => acc.name === accountName);
  return account;
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

export const getAddressNameMap = memoize((addressBook, myTritiumAccounts) => {
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
  if (myTritiumAccounts) {
    myTritiumAccounts.forEach(element => {
      map[element.address] = element.name;
    });
  }
  return map;
});

const Address = styled.span(({ theme }) => ({
  color: theme.mixer(0.75),
}));

export const getRecipientSuggestions = memoize(
  (addressBook, myTritiumAccounts) => {
    console.log(myTritiumAccounts);
    console.log(addressBook);
    const suggestions = [];
    if (addressBook) {
      Object.values(addressBook).forEach(contact => {
        if (contact.addresses) {
          contact.addresses.forEach(({ address, label, isMine }) => {
            if (!isMine) {
              suggestions.push({
                name: contact.name,
                value: address,
                token: '0',
                display: (
                  <span>
                    {contact.name}
                    {label ? ' - ' + label : ''}{' '}
                    <TokenRecipientName>{'(NXS)'}</TokenRecipientName>{' '}
                    <Address>{address}</Address>
                  </span>
                ),
              });
            }
          });
        }
      });
    }
    console.log(myTritiumAccounts);
    if (myTritiumAccounts) {
      myTritiumAccounts.forEach(element => {
        suggestions.push({
          name: element.name,
          value: element.address,
          token: element.token,
          display: (
            <span>
              {element.name} {'   '}
              <TokenRecipientName>{`(${element.token_name ||
                'Tokens'})`}</TokenRecipientName>{' '}
              <Address>{element.address}</Address>
            </span>
          ),
        });
      });
    }
    return suggestions;
  }
);

export const getRegisteredFieldNames = memoize(registeredFields =>
  Object.keys(registeredFields || {})
);
