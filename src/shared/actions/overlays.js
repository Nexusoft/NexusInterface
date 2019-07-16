import * as TYPE from 'consts/actionTypes';
import ConfirmDialog from 'components/Dialogs/ConfirmDialog';
import ErrorDialog from 'components/Dialogs/ErrorDialog';
import SuccessDialog from 'components/Dialogs/SuccessDialog';

const newModalId = (function() {
  let counter = 1;
  return () => `modal-${counter++}`;
})();

const newNotifId = (function() {
  let counter = 1;
  return () => `notif-${counter++}`;
})();

const newTaskId = (function() {
  let counter = 1;
  return () => `task-${counter++}`;
})();

/**
 * Modal
 * ===========================
 */
export const openModal = (component, props) => ({
  type: TYPE.CREATE_MODAL,
  payload: {
    id: newModalId(),
    component,
    props,
  },
});

// Using regular function here to avoid circular dependency which causes error
export function removeModal(modalId) {
  return {
    type: TYPE.REMOVE_MODAL,
    payload: { id: modalId },
  };
}

export const openConfirmDialog = props => openModal(ConfirmDialog, props);

export const openErrorDialog = props => openModal(ErrorDialog, props);

export const openSuccessDialog = props => openModal(SuccessDialog, props);

/**
 * Notification
 * ===========================
 */
export const showNotification = (content, options) => ({
  type: TYPE.CREATE_NOTIFICATION,
  payload: {
    id: newNotifId(),
    content,
    ...(typeof options === 'string' ? { type: options } : options),
  },
});

export const removeNotification = notifId => ({
  type: TYPE.REMOVE_NOTIFICATION,
  payload: { id: notifId },
});

/**
 * Background task
 * ===========================
 */
export const showBackgroundTask = (component, props) => ({
  type: TYPE.CREATE_BACKGROUND_TASK,
  payload: {
    id: newTaskId(),
    component,
    props,
  },
});

export const removeBackgroundTask = taskId => ({
  type: TYPE.REMOVE_BACKGROUND_TASK,
  payload: { id: taskId },
});
