import { UPDATE_FORM_INSTANCE } from 'consts/actionTypes';
import store from 'store';

export function updateFormInstance(form, state) {
  store.dispatch({
    type: UPDATE_FORM_INSTANCE,
    payload: { form, state },
  });
}

export function getFormInstance(form) {
  return store.getState().forms[form];
}
