import { FORM_ERROR } from 'final-form';
import { useField } from 'react-final-form';

import { openErrorDialog } from 'lib/dialog';

const forms = {};

export function updateFormInstance(formName, instance) {
  forms[formName] = instance;
}

export const getFormInstance = (formName) => forms[formName];

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
  ({ submit, onSuccess, onFail = defaultOnFail, errorMessage }) =>
  async (values, form) => {
    let result;
    try {
      result = await Promise.resolve(submit(values, form));
    } catch (err) {
      return onFail(err, errorMessage);
    }
    onSuccess?.(result, values, form);
  };

export function useFieldValue(name) {
  const {
    input: { value },
  } = useField(name, { subscription: { value: true } });
  return value;
}

export const numericOnly = (value) =>
  (value ? String(value) : '').replace(/\D/g, '');

export const trimText = (text) => text && text.trim();

/**
 * VALIDATE FUNCTIONS
 */

export const checkAll =
  (...validations) =>
  (value, allValues, meta) => {
    for (const validation of validations) {
      const result = validation(value, allValues, meta);
      if (result) return result;
    }
  };

export const required =
  (message = __('Required!')) =>
  (value) =>
    !value && value !== 0 ? message : undefined;

export const regex =
  (regexp, message = __('Invalid!')) =>
  (value) =>
    typeof value !== 'string' || !regexp.test(value) ? message : undefined;

export const range =
  (min, max, message = __('Out of range!')) =>
  (value) =>
    ((min || min === 0) && value < min) || ((max || max === 0) && value > max)
      ? message
      : undefined;

export const oneOf = (list, message) => (value) =>
  !list.includes(value) ? message : undefined;

export const notOneOf = (list, message) => (value) =>
  list.includes(value) ? message : undefined;

export const minChars = (min) => (value) =>
  value.length < min
    ? __('Must be at least %{min} characters', { min })
    : undefined;

export function resolveValue(input) {
  if (input && input.target) {
    const el = input.target;
    if (el.type === 'checkbox') {
      return el.checked;
    } else if (el.type === 'number') {
      return parseInt(el.value);
    } else {
      return el.value;
    }
  }
  return input;
}

export function handleError(error, message = __('Error')) {
  openErrorDialog({
    message,
    note: (error && error.message) || __('Unknown error'),
  });
}
