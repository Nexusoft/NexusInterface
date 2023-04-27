import styled from '@emotion/styled';
import memoize from 'utils/memoize';
import rpc from 'lib/rpc';

export const selectAccountOptions = memoize(
  (myAccounts) => {
    if (myAccounts) {
      return myAccounts.map((acc) => ({
        value: acc.account,
        display: `${acc.account} (${acc.balance} NXS)`,
      }));
    }
    return [];
  },
  (state) => [state.myAccounts]
);

export const getAccountBalance = memoize((accountName, myAccounts) => {
  const account = myAccounts.find((acc) => acc.account === accountName);
  return account && account.balance;
});

export const selectAddressNameMap = memoize(
  (addressBook) => {
    const map = {};
    if (addressBook) {
      Object.values(addressBook).forEach((contact) => {
        if (contact.addresses) {
          contact.addresses.forEach(({ address, label }) => {
            map[address] = contact.name + (label ? ' - ' + label : '');
          });
        }
      });
    }
    return map;
  },
  (state) => [state.addressBook]
);

export const lookUpContactName = (lookupAddress) => (state) => {
  for (const contact of Object.values(state.addressBook)) {
    if (contact.addresses) {
      for (const { address, label } of contact.addresses) {
        if (address === lookupAddress) {
          return contact.name + (label ? ' - ' + label : '');
        }
      }
    }
  }
};

const Address = styled.span(({ theme }) => ({
  color: theme.mixer(0.75),
}));

export const selectRecipientSuggestions = memoize(
  (addressBook) => {
    const suggestions = [];
    if (addressBook) {
      for (const contact of Object.values(addressBook)) {
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
      }
    }
    return suggestions;
  },
  (state) => [state.addressBook]
);

export const getRegisteredFieldNames = memoize((registeredFields) =>
  Object.keys(registeredFields || {})
);

export async function validateAddress(value) {
  try {
    const result = await rpc('validateaddress', [value]);
    if (!result.isvalid) {
      return __('Invalid address');
    }
    if (result.ismine) {
      return __('This is an address registered to this wallet.');
    }
  } catch (err) {
    return __('Invalid address');
  }
}

export const notSameAccount = (value, { sendFrom }) =>
  value === sendFrom ? __('Cannot move to the same account') : undefined;
