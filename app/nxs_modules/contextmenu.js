export default class ContextMenuBuilder {
  constructor() {
    this.defaultContext = this.ReturnDefaultContextMenu();
  }

  ReturnDefaultContextMenu() {
    return [
      {
        label: 'Copy',
        accelerator: 'CmdOrCtrl+C',
        role: 'copy',
      },
      {
        label: 'Paste',
        accelerator: 'CmdOrCtrl+V',
        role: 'paste',
      },
    ];
  }
}
