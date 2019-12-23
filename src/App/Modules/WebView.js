// External
import React from 'react';
import { existsSync } from 'fs';
import { join } from 'path';
import { ipcRenderer } from 'electron';

// Internal Global
import { modulesDir } from 'consts/paths';
import { setActiveWebView, unsetActiveWebView } from 'lib/modules';

let domain = '';
(async () => {
  domain = await ipcRenderer.invoke('get-file-server-domain');
})();

/**
 * WebView
 *
 * @class WebView
 * @extends {Component}
 */
class WebView extends React.Component {
  webviewRef = React.createRef();

  /**
   * Creates an instance of WebView.
   * @param {*} props
   * @memberof WebView
   */
  constructor(props) {
    super(props);
    const { module } = this.props;
    const moduleFiles = module.files.map(file => join(module.dirName, file));
    ipcRenderer.invoke('serve-module-files', moduleFiles);
  }

  /**
   * Component Mount Callback
   *
   * @memberof WebView
   */
  componentDidMount() {
    setActiveWebView(this.webviewRef.current, this.props.module.name);
  }

  /**
   * Component Unmount Callback
   *
   * @memberof WebView
   */
  componentWillUnmount() {
    unsetActiveWebView();
  }

  /**
   * Component's Renderable JSX
   *
   * @returns
   * @memberof WebView
   */
  render() {
    const { module, className, style } = this.props;
    const entry = module.entry || 'index.html';
    const entryPath = join(modulesDir, module.dirName, entry);
    if (!existsSync(entryPath)) return null;

    const entryUrl = `${domain}/modules/${module.name}/${entry}`;
    const preloadUrl =
      process.env.NODE_ENV === 'development'
        ? `file://${process.cwd()}/build/module_preload.dev.js`
        : 'module_preload.prod.js';

    return (
      <webview
        className={className}
        style={style}
        ref={this.webviewRef}
        src={entryUrl}
        preload={preloadUrl}
      />
    );
  }
}

export default WebView;
