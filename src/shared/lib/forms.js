import { UPDATE_FORM_STATE } from 'consts/actionTypes';
import store from 'store';

export function updateFormState(form, state) {
  store.dispatch({
    type: UPDATE_FORM_STATE,
    payload: { form, state },
  });
}
