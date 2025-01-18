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
 * Console/Console
 * ===========================
 */
export const updateConsoleInput = (value) => {
  store.dispatch({
    type: TYPE.SET_CONSOLE_INPUT,
    payload: value,
  });
};

export const setCommandList = (commandList) => {
  store.dispatch({
    type: TYPE.SET_COMMAND_LIST,
    payload: commandList,
  });
};

export const commandHistoryUp = () => {
  store.dispatch({
    type: TYPE.COMMAND_HISTORY_UP,
  });
};
export const commandHistoryDown = () => {
  store.dispatch({
    type: TYPE.COMMAND_HISTORY_DOWN,
  });
};
export const executeCommand = (cmd) => {
  store.dispatch({
    type: TYPE.EXECUTE_COMMAND,
    payload: cmd,
  });
};

export const printCommandOutput = (text) => {
  store.dispatch({
    type: TYPE.PRINT_COMMAND_OUTPUT,
    payload: text,
  });
};

export const printCommandError = (msg) => {
  store.dispatch({
    type: TYPE.PRINT_COMMAND_ERROR,
    payload: msg,
  });
};

export const resetConsole = () => {
  store.dispatch({
    type: TYPE.RESET_CONSOLE,
  });
};
export const printCoreOutput = (output) => {
  store.dispatch({
    type: TYPE.PRINT_CORE_OUTPUT,
    payload: output,
  });
};

export const pauseCoreOutput = () => {
  store.dispatch({
    type: TYPE.PAUSE_CORE_OUTPUT,
  });
};
export const unpauseCoreOutput = () => {
  store.dispatch({
    type: TYPE.UNPAUSE_CORE_OUTPUT,
  });
};
export const clearCoreOutput = () => {
  store.dispatch({
    type: TYPE.CLEAR_CORE_OUTPUT,
  });
};

/**
 * Other
 * ===========================
 */

export const rqDevToolsOpenAtom = atom(false);

export const jotaiDevToolsOpenAtom = atom(false);
