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
  expires: null,
};

export const defaultValues = {
  sendFrom: null,
  recipients: [defaultRecipient],
  reference: null,
  expires: null,
};

export function goToSend(formValues) {
  store.dispatch(initialize(formName, { ...defaultValues, ...formValues }));
  store.dispatch(reset(formName));
  history.push('/Send');
}

export function toggleShowAdvanced() {
  store.dispatch({
    type: TYPE.TOGGLE_SHOW_ADVANCED_SEND,
  });
}
