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

export function RPCErrorHandler(errors, dispatch, submitError) {
  if (!errors || !Object.keys(errors).length) {
    UIController.openErrorDialog({
      message: 'Error setting Transaction Fee',
      note: submitError || 'An unknown error occurred',
    });
  }
}
