// External
import React from 'react';
import { connect } from 'react-redux';
import { existsSync } from 'fs';
import { join } from 'path';

// Internal Global
import config from 'api/configuration';
import * as RPC from 'scripts/rpc';

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
      webview.addEventListener('ipc-message', async event => {
        switch (event.channel) {
          case 'rpc-call':
            if (!event.args || !event.args.length) return;
            const [{ command, params, id }] = event.args;
            try {
              console.log(command, params);
              const response = await RPC.PROMISE(command, ...(params || []));
              webview.send(`rpc-response${id ? `:${id}` : ''}`, response);
            } catch (err) {
              console.error(err);
              webview.send(`rpc-error${id ? `:${id}` : ''}`, err);
            }
        }
      });
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

  componentDidUpdate(prevProps) {
    const webview = this.webviewRef.current;
    if (webview && !webview.isLoading()) {
      const { theme, settings, coreInfo, difficulty } = this.props;
      if (prevProps.theme !== theme) {
        webview.send('theme-updated', theme);
      }
      if (prevProps.settings !== settings) {
        webview.send('settings-updated', settings);
      }
      if (prevProps.coreInfo !== coreInfo) {
        webview.send('core-info-updated', coreInfo);
      }
      if (prevProps.difficulty !== difficulty) {
        webview.send('difficulty-updated', difficulty);
      }
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
    const env = process.env.NODE_ENV === 'development' ? 'dev' : 'prod';

    return (
      <webview
        className={className}
        style={style}
        ref={this.webviewRef}
        src={entryPath}
        preload={`file://${__dirname}/dist/module_preload.${env}.js`}
      />
    );
  }
}

export default WebView;
