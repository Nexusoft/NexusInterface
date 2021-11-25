import { initialize, reset } from 'redux-form';
import { useSelector } from 'react-redux';

import { history } from 'lib/wallet';
import { useFieldValue } from 'lib/form';
import { timeToObject } from 'utils/misc';
import store from 'store';
import memoize from 'utils/memoize';

export const formName = 'send';

export const defaultTxExpiry = 604800;

export function getDefaultRecipient({ txExpiry } = {}) {
  const recipient = {
    address: null,
    amount: '',
    fiatAmount: '',
    reference: null,
    expireDays: 7,
    expireHours: 0,
    expireMinutes: 0,
    expireSeconds: 0,
  };
  if (txExpiry) {
    const { days, hours, minutes, seconds } = timeToObject(txExpiry);
    recipient.expireDays = days;
    recipient.expireHours = hours;
    recipient.expireMinutes = minutes;
    recipient.expireSeconds = seconds;
  }
  return recipient;
}

export function getDefaultValues(options) {
  return {
    sendFrom: null,
    recipients: [getDefaultRecipient(options)],
    advancedOptions: false,
  };
}

export function goToSend(formValues) {
  store.dispatch(
    initialize(formName, { ...getDefaultValues(), ...formValues })
  );
  store.dispatch(reset(formName));
  history.push('/Send');
}

export const selectInitialValues = memoize(
  (txExpiry) => getDefaultValues({ txExpiry }),
  (state) => [state.core.config?.txExpiry]
);

export const selectAddressNameMap = memoize(
  (addressBook, myAccounts) => {
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
    if (myAccounts) {
      myAccounts.forEach((element) => {
        map[element.address] = element.name;
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
