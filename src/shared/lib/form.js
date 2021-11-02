import { FORM_ERROR } from 'final-form';

import { UPDATE_FORM_INSTANCE } from 'consts/actionTypes';
import store from 'store';
import { openErrorDialog } from 'lib/dialog';

export function updateFormInstance(formName, instance) {
  store.dispatch({
    type: UPDATE_FORM_INSTANCE,
    payload: { formName, instance },
  });
}

export const selectFormInstance = (formName) => (state) =>
  state.forms[formName];

const defaultOnFail = (err, errorMessage) => {
  openErrorDialog({
    message: errorMessage || __('Error'),
    note: err?.message || (typeof err === 'string' ? err : __('Unknown error')),
  });
  return {
    [FORM_ERROR]: err,
  };
};

export const formSubmit =
  ({ preSubmit, submit, onSuccess, onFail = defaultOnFail, errorMessage }) =>
  async (values, form) => {
    let result;
    try {
      if (preSubmit) {
        const proceed = await Promise.resolve(preSubmit(values, form));
        if (!proceed) return;
      }

      result = await Promise.resolve(submit(values, form));
    } catch (err) {
      return onFail(err, errorMessage);
    }
    onSuccess?.(result, values, form);
  };
