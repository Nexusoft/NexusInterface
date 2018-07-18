var {remote} = require('electron')
var {Menu, MenuItem} = remote

//Write the default context menu here
const template = [
    {
      label: 'File',
      submenu: [
  
        {
          label: 'Copy',
          role: 'copy',
          
        }
      ]
    },
    {
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click (item, focusedWindow) {
          if (focusedWindow) focusedWindow.reload()
        }
    }
  ]



//Allow this for export
module.exports = {
    contexttemplate:template
}
