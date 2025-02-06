import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import qs from 'querystring';

import { navigate } from 'lib/wallet';
import { useFieldValue, getFormInstance } from 'lib/form';
import { coreConfigAtom } from 'lib/coreConfig';
import { accountsQuery, tokensQuery } from 'lib/user';
import { timeToObject } from 'utils/misc';
import { store } from 'lib/store';
import memoize from 'utils/memoize';
import { Account, Token } from 'lib/api';

interface Recipient {
  nameOrAddress?: string;
  name?: string;
  address?: string;
  amount?: string;
  fiatAmount?: string;
  reference?: number;
}

interface Expiry {
  expireDays: number;
  expireHours: number;
  expireMinutes: number;
  expireSeconds: number;
}

export const formName = 'send';

export function getDefaultRecipient() {
  const recipient: Recipient = {
    nameOrAddress: undefined,
    name: undefined, // hidden field
    address: undefined, // hidden field
    amount: '',
    fiatAmount: '',
    reference: undefined,
  };
  return recipient;
}

function getDefaultExpiry() {
  const expiry: Expiry = {
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

function getDefaultSendFrom(accounts?: Account[]) {
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

function getFormValues({
  customValues,
  accounts,
}: {
  customValues?: any;
  accounts?: Account[];
}) {
  const defaultRecipient = getDefaultRecipient();
  return {
    sendFrom: customValues?.sendFrom || getDefaultSendFrom(accounts),
    // not accepting fiatAmount
    recipients: customValues?.recipients?.map(
      ({ nameOrAddress, amount, reference }: Recipient) => ({
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

export function goToSend(customValues: any) {
  navigate(`/Send?state=${JSON.stringify(customValues)}`);
}

export function useInitialValues() {
  const location = useLocation();
  // React-router's search field has a leading ? mark but
  // qs.parse will consider it invalid, so remove it
  const queryParams = qs.parse(location.search.substring(1));
  const accounts = accountsQuery.use();

  const stateJson = queryParams?.state;
  let customValues = undefined;
  try {
    if (Array.isArray(stateJson)) {
      customValues = JSON.parse(stateJson?.join(''));
    } else if (stateJson) {
      customValues = JSON.parse(stateJson);
    }
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

export const getSource = memoize(
  (
    sendFrom: string,
    accounts: Account[] | undefined,
    userTokens: Token[] | undefined
  ) => {
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
  }
);

export const useSource = () => {
  const sendFrom = useFieldValue('sendFrom') as string;
  const accounts = accountsQuery.use();
  const userTokens = tokensQuery.use();
  const source = getSource(sendFrom, accounts, userTokens);
  return source;
};
