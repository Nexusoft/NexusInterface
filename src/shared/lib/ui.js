import * as TYPE from 'consts/actionTypes';
import store from 'store';
import { atom } from 'jotai';

const newModalId = (function () {
  let counter = 1;
  return () => `modal-${counter++}`;
})();

const newNotifId = (function () {
  let counter = 1;
  return () => `notif-${counter++}`;
})();

const newTaskId = (function () {
  let counter = 1;
  return () => `task-${counter++}`;
})();

/**
 * Modal
 * ===========================
 */
export function openModal(component, props) {
  const id = newModalId();
  store.dispatch({
    type: TYPE.CREATE_MODAL,
    payload: {
      id,
      component,
      props,
    },
  });
  return id;
}

// Using regular function here to avoid circular dependency which causes error
export function removeModal(modalId) {
  store.dispatch({
    type: TYPE.REMOVE_MODAL,
    payload: { id: modalId },
  });
}

export function isModalOpen(modalComponent) {
  const {
    ui: { modals },
  } = store.getState();
  return modals.some(({ component }) => component === modalComponent);
}

/**
 * Notification
 * ===========================
 */
export function showNotification(content, options) {
  store.dispatch({
    type: TYPE.CREATE_NOTIFICATION,
    payload: {
      id: newNotifId(),
      content,
      ...(typeof options === 'string' ? { type: options } : options),
    },
  });
}

export function removeNotification(notifId) {
  store.dispatch({
    type: TYPE.REMOVE_NOTIFICATION,
    payload: { id: notifId },
  });
}

/**
 * Background task
 * ===========================
 */
export function showBackgroundTask(component, props) {
  store.dispatch({
    type: TYPE.CREATE_BACKGROUND_TASK,
    payload: {
      id: newTaskId(),
      component,
      props,
    },
  });
}

export function removeBackgroundTask(taskId) {
  store.dispatch({
    type: TYPE.REMOVE_BACKGROUND_TASK,
    payload: { id: taskId },
  });
}

/**
 * Other
 * ===========================
 */

export const rqDevToolsOpenAtom = atom(false);

export const jotaiDevToolsOpenAtom = atom(false);
