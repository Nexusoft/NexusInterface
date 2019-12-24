import { Menu } from 'electron';

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

export function setApplicationMenu(menuTemplate) {
  refillClick(menuTemplate);
  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
}
