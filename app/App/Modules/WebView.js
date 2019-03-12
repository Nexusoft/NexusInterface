// External
import React from 'react';
import { connect } from 'react-redux';
import { existsSync } from 'fs';
import { join } from 'path';

// Internal Global
import config from 'api/configuration';

/**
 * WebView
 *
 * @class WebView
 * @extends {Component}
 */
@connect(state => ({
  modules: state.modules,
}))
class WebView extends React.Component {
  webviewRef = React.createRef();

  componentDidMount() {
    this.openDevTools();
  }

  componentDidUpdate() {
    this.openDevTools();
  }

  openDevTools = () => {
    if (this.webviewRef.current) {
      this.webviewRef.current.addEventListener('dom-ready', () => {
        this.webviewRef.current.openDevTools();
      });
    }
  };

  /**
   *
   *
   * @returns
   * @memberof WebView
   */
  render() {
    const { module, ...rest } = this.props;
    const entry = module.entry || 'index.html';
    const entryPath = join(config.GetModulesDir(), module.dirName, entry);
    if (!existsSync(entryPath)) return null;

    return (
      <webview
        {...rest}
        ref={this.webviewRef}
        src={entryPath}
        preload={`file://${__dirname}/module_preload.js`}
      />
    );
  }
}

export default WebView;
