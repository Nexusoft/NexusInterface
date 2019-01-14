import UIController from 'components/UIController';

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

export function rpcErrorHandler(message) {
  return (errors, dispatch, submitError) => {
    // If errors object has some values it means the form validation failed
    // In that case, no need to open an error dialog
    if (!errors || !Object.keys(errors).length) {
      UIController.openErrorDialog({
        message,
        note: submitError || 'An unknown error occurred',
      });
    }
  };
}

export const trimText = text => text && text.trim();
