/**
 * Provides the default context menu behaviour
 *
 * @export
 * @class ContextMenuBuilder
 */
export default class ContextMenuBuilder {
  /**
   *Creates an instance of ContextMenuBuilder.
   * @memberof ContextMenuBuilder
   */
  constructor() {
    this.defaultContext = this.ReturnDefaultContextMenu();
  }

  /**
   * Returns the Options for the context menu
   *
   * @returns
   * @memberof ContextMenuBuilder
   */
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
