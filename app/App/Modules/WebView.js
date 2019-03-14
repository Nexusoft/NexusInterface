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
@connect(({ modules, theme, core, settings }) => ({
  modules,
  theme,
  settings,
  coreInfo: core.info,
  difficulty: core.difficulty,
}))
class WebView extends React.Component {
  webviewRef = React.createRef();

  componentDidMount() {
    const webview = this.webviewRef.current;
    if (webview) {
      webview.addEventListener('dom-ready', () => {
        const {
          theme,
          coreInfo,
          difficulty,
          settings: { locale, fiatCurrency, addressStyle },
        } = this.props;
        webview.send('initialize', {
          theme,
          coreInfo,
          difficulty,
          settings: { locale, fiatCurrency, addressStyle },
        });
        webview.openDevTools();
      });
    }
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

    return (
      <webview
        className={className}
        style={style}
        ref={this.webviewRef}
        src={entryPath}
        preload={`file://${__dirname}/dist/module_preload.dev.js`}
      />
    );
  }
}

export default WebView;
