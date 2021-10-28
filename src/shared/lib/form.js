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

export const formSubmit =
  ({ preSubmit, submit, onSuccess, errorMessage }) =>
  async (values, form) => {
    if (preSubmit) {
      const proceed = preSubmit(values, form);
      if (!proceed) return;
    }

    try {
      const result = await Promise.resolve(submit(values, form));
    } catch (err) {
      openErrorDialog({
        message: errorMessage || __('Error'),
        note:
          err?.message || (typeof err === 'string' ? err : __('Unknown error')),
      });
      return {
        [FORM_ERROR]: err,
      };
    }
    onSuccess?.(result, values, form);
  };
