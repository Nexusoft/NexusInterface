import { MouseEvent } from 'react';

export interface MenuItemConstructorOptions {
  label?: string;
  accelerator?: string;
  role?: string;
  type?: string;
  id?: string;
  enabled?: boolean;
  visible?: boolean;
  checked?: boolean;
  click?: (...args: any[]) => void;
  submenu?: MenuItemConstructorOptions[];
}

export const defaultMenu: MenuItemConstructorOptions[] = [
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

export function showDefaultMenu(e: MouseEvent<HTMLElement>) {
  e.preventDefault();
  void window.nexusElectron.app.popupContextMenu(defaultMenu);
}

type CleanTemplateItem = Omit<
  MenuItemConstructorOptions,
  'click' | 'submenu'
> & {
  click?: boolean;
  submenu?: CleanTemplateItem[];
};

/**
 * Extracts click handlers from the menu template and modify the
 * template so that it can go through IPC messages
 */
function deconstructItem(
  item: MenuItemConstructorOptions,
  actions: Record<string, Function>
) {
  const cleanItem: CleanTemplateItem = {
    ...item,
    click: undefined,
    submenu: undefined,
  };
  if (typeof item.click === 'function') {
    actions[item.id || ''] = item.click;
    cleanItem.click = true;
  }
  if (Array.isArray(item.submenu)) {
    cleanItem.submenu = item.submenu.map((subItem) =>
      deconstructItem(subItem, actions)
    );
  }
  return cleanItem;
}

/**
 * Shows a context menu where the mouse cursor currently is.
 * IMPORTANT NOTE: All the menu items that have a click callback MUST
 * also have an id.
 *
 * @export
 * @param {*} template
 */
export async function popupContextMenu(
  template: MenuItemConstructorOptions[],
  webContentsId?: number
) {
  const actions: Record<string, Function> = {};
  const cleanTemplate = template.map((item) => deconstructItem(item, actions));
  const id = await window.nexusElectron.app.popupContextMenu(
    cleanTemplate,
    webContentsId
  );
  if (id && actions[id]) {
    actions[id]();
  }
}
