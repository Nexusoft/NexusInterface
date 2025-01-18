import { jotaiStore } from 'store';
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
 * Atoms
 * ===========================
 */
export const modalsAtom = atom([]);
export const notificationsAtom = atom([]);
export const backgroundTasksAtom = atom([]);
export const rqDevToolsOpenAtom = atom(false);
export const jotaiDevToolsOpenAtom = atom(false);

/**
 * Modal
 * ===========================
 */
export function openModal(component, props) {
  const id = newModalId();
  jotaiStore.set(modalsAtom, (modals) => [
    ...modals,
    {
      id,
      component,
      props,
    },
  ]);
  return id;
}

// Using regular function here to avoid circular dependency which causes error
export function removeModal(modalId) {
  jotaiStore.set(modalsAtom, (modals) =>
    modals.filter((modal) => modal.id !== modalId)
  );
}

export function isModalOpen(modalComponent) {
  const modals = jotaiStore.get(modalsAtom);
  return modals.some(({ component }) => component === modalComponent);
}

/**
 * Notification
 * ===========================
 */
export function showNotification(content, options) {
  const id = newNotifId();
  jotaiStore.set(notificationsAtom, (notifications) => [
    {
      id,
      content,
      ...(typeof options === 'string' ? { type: options } : options),
    },
    ...notifications,
  ]);
  return id;
}

export function removeNotification(notifId) {
  jotaiStore.set(notificationsAtom, (notifications) =>
    notifications.filter((notification) => notification.id !== notifId)
  );
}

/**
 * Background task
 * ===========================
 */
export function showBackgroundTask(component, props) {
  const id = newTaskId();
  jotaiStore.set(backgroundTasksAtom, (backgroundTasks) => [
    ...backgroundTasks,
    {
      id,
      component,
      props,
    },
  ]);
  return id;
}

export function removeBackgroundTask(taskId) {
  jotaiStore.set(backgroundTasksAtom, (tasks) =>
    tasks.filter((task) => task.id !== taskId)
  );
}
