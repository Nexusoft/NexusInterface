import { initialize, reset } from 'redux-form';

import { history } from 'lib/wallet';
import store from 'store';

export const formName = 'send';

export const defaultValues = {
  sendFrom: null,
  recipients: [
    {
      address: null,
      amount: '',
      fiatAmount: '',
    },
  ],
  reference: null,
  expires: null,
};

export function send(formValues) {
  store.dispatch(initialize('send', { ...formValues, ...defaultValues }));
  store.dispatch(reset('send'));
  history.push('/Send');
}
