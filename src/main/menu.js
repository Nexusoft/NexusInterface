import { Menu } from 'electron';

// APP MENU
// =============================================================================

function handleClick(menuItem) {
  if (global.mainWindow) {
    global.mainWindow.webContents.send('menu-click:' + menuItem.id);
  }
}

function refillClick(template) {
  template.forEach(item => {
    if (item.click) {
      item.click = handleClick;
    }
    if (item.submenu) {
      refillClick(item.submenu);
    }
  });
}

export function setApplicationMenu(template) {
  refillClick(template);
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// CONTEXT MENU
// =============================================================================

export function popupContextMenu(template) {
  return new Promise((resolve, reject) => {
    try {
      const refillClick = template => {
        template.forEach(item => {
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
      menu.popup({
        window: global.mainWindow,
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
