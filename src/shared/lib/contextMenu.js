import { ipcRenderer } from 'electron';

export const defaultMenu = [
  {
    label: __('Copy'),
    accelerator: 'CmdOrCtrl+C',
    role: 'copy',
  },
  {
    label: __('Paste'),
    accelerator: 'CmdOrCtrl+V',
    role: 'paste',
  },
];

export function showDefaultMenu(e) {
  e.preventDefault();
  ipcRenderer.invoke('popup-context-menu', defaultMenu);
}

/**
 * Extracts click handlers from the menu template and modify the
 * template so that it can go through IPC messages
 *
 * @param {*} template
 * @returns
 */
function transformTemplate(template) {
  const actions = {};
  template.forEach((item) => {
    if (typeof item.click === 'function') {
      actions[item.id] = item.click;
      item.click = true;
    }
    if (item.submenu) {
      Object.assign(actions, transformTemplate(item.submenu));
    }
  });
  return actions;
}

/**
 * Shows a context menu where the mouse cursor currently is.
 * IMPORTANT NOTE: All the menu items that have a click callback MUST
 * also have an id.
 *
 * @export
 * @param {*} template
 */
export async function popupContextMenu(template, webContentsId) {
  const templateCopy = [...template];
  const actions = transformTemplate(templateCopy);
  const id = await ipcRenderer.invoke(
    'popup-context-menu',
    templateCopy,
    webContentsId
  );
  if (id && actions[id]) {
    actions[id]();
  }
}
