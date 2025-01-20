import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import qs from 'querystring';

import { navigate } from 'lib/wallet';
import { useFieldValue, getFormInstance } from 'lib/form';
import { coreConfigAtom } from './coreConfig';
import { accountsQuery, tokensQuery } from './user';
import { timeToObject } from 'utils/misc';
import { store } from 'lib/store';
import memoize from 'utils/memoize';

export const formName = 'send';

export function getDefaultRecipient() {
  const recipient = {
    nameOrAddress: null,
    name: null, // hidden field
    address: null, // hidden field
    amount: '',
    fiatAmount: '',
    reference: null,
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
  const txExpiry = store.get(coreConfigAtom)?.txExpiry;
  if (txExpiry) {
    const { days, hours, minutes, seconds } = timeToObject(txExpiry);
    expiry.expireDays = days;
    expiry.expireHours = hours;
    expiry.expireMinutes = minutes;
    expiry.expireSeconds = seconds;
  }
  return expiry;
}

function getDefaultSendFrom(accounts) {
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

function getFormValues({ customValues, accounts } = {}) {
  const defaultRecipient = getDefaultRecipient();
  return {
    sendFrom: customValues?.sendFrom || getDefaultSendFrom(accounts),
    // not accepting fiatAmount
    recipients: customValues?.recipients?.map(
      ({ nameOrAddress, amount, reference }) => ({
        ...defaultRecipient,
        nameOrAddress,
        amount,
        reference,
      })
    ) || [defaultRecipient],
    expiry: {
      ...getDefaultExpiry(),
      ...customValues?.expiry,
    },
    advancedOptions: customValues?.advancedOptions || false,
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
  const accounts = accountsQuery.use();

  const stateJson = queryParams?.state;
  let customValues = null;
  try {
    customValues = stateJson && JSON.parse(stateJson);
  } catch (err) {}
  const initialValues = getFormValues({ customValues, accounts });

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

export const getSource = memoize((sendFrom, accounts, userTokens) => {
  const matches = /^(account|token):(.+)/.exec(sendFrom);
  const [_, type, address] = matches || [];

  if (type === 'account') {
    const account = accounts?.find((acc) => acc.address === address);
    if (account) return { account };
  }

  if (type === 'token') {
    const token = userTokens?.find((tkn) => tkn.address === address);
    if (token) return { token };
  }

  return null;
});

export const useSource = () => {
  const sendFrom = useFieldValue('sendFrom');
  const accounts = accountsQuery.use();
  const userTokens = tokensQuery.use();
  const source = getSource(sendFrom, accounts, userTokens);
  return source;
};
