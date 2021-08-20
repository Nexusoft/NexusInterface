import { initialize, reset } from 'redux-form';

import { history } from 'lib/wallet';
import { timeToObject } from 'utils/misc';
import store from 'store';

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
