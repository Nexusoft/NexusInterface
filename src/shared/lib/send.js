import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import qs from 'querystring';
import { useSelector } from 'react-redux';

import { navigate } from 'lib/wallet';
import { useFieldValue, getFormInstance } from 'lib/form';
import { timeToObject } from 'utils/misc';
import store from 'store';
import memoize from 'utils/memoize';

export const formName = 'send';

export function getDefaultRecipient() {
  const recipient = {
    nameOrAddress: null,
    name: null, // hidden field
    address: null, // hidden field
    amount: '',
    fiatAmount: '',
  };
  return recipient;
}

function getDefaultExpiry() {
  const expiry = {
    expireDays: 7,
    expireHours: 0,
    expireMinutes: 0,
    expireSeconds: 0,
  };
  const txExpiry = store.getState().core.config?.txExpiry;
  if (txExpiry) {
    const { days, hours, minutes, seconds } = timeToObject(txExpiry);
    expiry.expireDays = days;
    expiry.expireHours = hours;
    expiry.expireMinutes = minutes;
    expiry.expireSeconds = seconds;
  }
  return expiry;
}

function getDefaultSendFrom() {
  const state = store.getState();
  const {
    user: { accounts },
  } = state;
  if (!accounts?.[0]) return null;
  const defaultAccount = accounts.find((acc) => acc.name === 'default');
  if (defaultAccount) {
    if (defaultAccount.balance === 0) {
      const accountHasBalance = accounts.find((acc) => acc.balance > 0);
      if (accountHasBalance) return `account:${accountHasBalance.address}`;
    }
    return `account:${defaultAccount.address}`;
  }
  return null;
}

function getFormValues(customValues) {
  const defaultRecipient = getDefaultRecipient();
  return {
    sendFrom: customValues?.sendFrom || getDefaultSendFrom(),
    // not accepting fiatAmount
    recipients: customValues?.recipients?.map(({ nameOrAddress, amount }) => ({
      ...defaultRecipient,
      nameOrAddress,
      amount,
    })) || [defaultRecipient],
    advancedOptions: {
      reference: null,
      ...getDefaultExpiry(),
      ...customValues?.advancedOptions,
    },
  };
}

export function goToSend(customValues) {
  navigate('/Send?state=' + JSON.stringify(customValues));
}

export function useInitialValues() {
  const location = useLocation();
  // React-router's search field has a leading ? mark but
  // qs.parse will consider it invalid, so remove it
  const queryParams = qs.parse(location.search.substring(1));

  const stateJson = queryParams?.state;
  let customValues = null;
  try {
    customValues = stateJson && JSON.parse(stateJson);
  } catch (err) {}
  const initialValues = getFormValues(customValues);

  const { sendFrom } = initialValues;
  const lastSendFromRef = useRef(sendFrom);
  useEffect(() => {
    if (!lastSendFromRef.current && sendFrom) {
      const form = getFormInstance(formName);
      form.change('sendFrom', sendFrom);
    }
    lastSendFromRef.current = sendFrom;
  }, [sendFrom]);

  // Reset the form when a new specific Send state is passed through the query string
  // Otherwise, always keep the form's current state
  useEffect(() => {
    if (customValues) {
      const form = getFormInstance(formName);
      form.restart(initialValues);
    }
  }, [stateJson]);

  return initialValues;
}

export const selectAddressNameMap = memoize(
  (addressBook, myAccounts) => {
    const map = {};
    if (addressBook) {
      Object.values(addressBook).forEach((contact) => {
        if (contact.addresses) {
          contact.addresses.forEach(({ address, label }) => {
            map[address] = {
              type: 'contact',
              label: contact.name + (label ? ' - ' + label : ''),
            };
          });
        }
      });
    }
    if (myAccounts) {
      myAccounts.forEach((account) => {
        if (account.name) {
          map[account.address] = {
            type: 'account',
            label: account.name,
          };
        }
      });
    }
    return map;
  },
  (state) => [state.addressBook, state.user.accounts]
);

export const getSource = memoize(
  (sendFrom, myAccounts, myTokens) => {
    const matches = /^(account|token):(.+)/.exec(sendFrom);
    const [_, type, address] = matches || [];

    if (type === 'account') {
      const account = myAccounts?.find((acc) => acc.address === address);
      if (account) return { account };
    }

    if (type === 'token') {
      const token = myTokens?.find((tkn) => tkn.address === address);
      if (token) return { token };
    }

    return null;
  },
  (state, sendFrom) => [sendFrom, state.user.accounts, state.user.tokens]
);

export const selectSource = () => {
  const sendFrom = useFieldValue('sendFrom');
  const source = useSelector((state) => getSource(state, sendFrom));
  return source;
};
