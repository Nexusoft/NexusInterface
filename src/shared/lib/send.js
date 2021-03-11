import { initialize, reset } from 'redux-form';

import * as TYPE from 'consts/actionTypes';
import { history } from 'lib/wallet';
import store from 'store';

export const formName = 'send';

export const defaultRecipient = {
  address: null,
  amount: '',
  fiatAmount: '',
  reference: null,
  expireDays: 7,
  expireHours: 0,
  expireMinutes: 0,
  expireSeconds: 0,
};

export const defaultValues = {
  sendFrom: null,
  recipients: [defaultRecipient],
  advancedOptions: false,
};

export function goToSend(formValues) {
  store.dispatch(initialize(formName, { ...defaultValues, ...formValues }));
  store.dispatch(reset(formName));
  history.push('/Send');
}
