import { Menu, webContents } from 'electron';

function handleClick(menuItem) {
  if (global.mainWindow) {
    global.mainWindow.webContents.send('menu-click:' + menuItem.id);
  }
}

function refillClick(template) {
  template.forEach((item) => {
    if (item.click) {
      item.click = handleClick;
    }
    if (item.submenu) {
      refillClick(item.submenu);
    }
  });
}

// APP MENU
// =============================================================================

export function setApplicationMenu(template) {
  refillClick(template);
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// CONTEXT MENU
// =============================================================================

export function popupContextMenu(template, webContentsId) {
  return new Promise((resolve, reject) => {
    try {
      const refillClick = (template) => {
        template.forEach((item) => {
          if (item.click) {
            item.click = () => {
              resolve(item.id);
            };
          }
          if (item.submenu) {
            refillClick(item.submenu);
          }
        });
      };
      refillClick(template);

      const menu = Menu.buildFromTemplate(template);
      const window = webContentsId
        ? webContents.fromId(webContentsId)
        : global.mainWindow;
      menu.popup({
        window,
        callback: () => {
          setTimeout(() => {
            resolve(null);
          }, 0);
        },
      });
    } catch (err) {
      reject(err);
    }
  });
}
