import { openErrorDialog } from 'lib/dialog';

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

export function errorHandler(message) {
  return (errors, dispatch, submitError) => {
    // If errors object has some values it means the form validation failed
    // In that case, no need to open an error dialog
    if (!errors || !Object.keys(errors).length) {
      handleError(submitError, message);
    }
  };
}

export const numericOnly = (value) =>
  (value ? String(value) : '').replace(/\D/g, '');

export const trimText = (text) => text && text.trim();
