// External
import React from 'react';
import { existsSync } from 'fs';
import { join } from 'path';
import urlJoin from 'url-join';
import { remote } from 'electron';

// Internal Global
import { registerWebView, unregisterWebView } from 'api/modules';
import config from 'api/configuration';
import appMenu from 'appMenu';

const fileServer = remote.getGlobal('fileServer');

/**
 * WebView
 *
 * @class WebView
 * @extends {Component}
 */
class WebView extends React.Component {
  webviewRef = React.createRef();

  constructor(props) {
    super(props);
    const { module } = this.props;
    const moduleFiles = module.files.map(file => join(module.dirName, file));
    fileServer.serveModuleFiles(moduleFiles);
  }

  componentDidMount() {
    registerWebView(this.webviewRef.current, this.props.module);
    appMenu.build();
  }

  componentWillUnmount() {
    unregisterWebView();
    appMenu.build();
  }

  /**
   *
   *
   * @returns
   * @memberof WebView
   */
  render() {
    const { module, className, style } = this.props;
    const entry = module.entry || 'index.html';
    const entryPath = join(config.GetModulesDir(), module.dirName, entry);
    if (!existsSync(entryPath)) return null;

    const entryUrl = urlJoin(fileServer.domain, 'modules', module.name, entry);
    const env = process.env.NODE_ENV === 'development' ? 'dev' : 'prod';

    return (
      <webview
        className={className}
        style={style}
        ref={this.webviewRef}
        src={entryUrl}
        preload={`./dist/module_preload.${env}.js`}
      />
    );
  }
}

export default WebView;
