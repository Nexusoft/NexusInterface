// External
import React from 'react';
import { connect } from 'react-redux';
import { existsSync } from 'fs';
import { join } from 'path';

// Internal Global
import config from 'api/configuration';
import UIController from 'components/UIController';
import * as RPC from 'scripts/rpc';

async function rpcCall([{ command, params, id }]) {
  try {
    const response = await RPC.PROMISE(command, ...(params || []));
    webview.send(`rpc-response${id ? `:${id}` : ''}`, response);
  } catch (err) {
    console.error(err);
    webview.send(`rpc-error${id ? `:${id}` : ''}`, err);
  }
}

function showNotif([content, param = {}]) {
  const options =
    typeof param === 'string'
      ? { type: param }
      : {
          type: param.type,
          autoClose: param.autoClose,
        };
  UIController.showNotification(content, options);
}

function showErrorDialog([options = {}]) {
  const { message, note } = options;
  UIController.openErrorDialog({ message, note });
}

function showSuccessDialog([options = {}]) {
  const { message, note } = options;
  UIController.openSuccessDialog({ message, note });
}

function confirm([options = {}]) {
  const { id, question, note, yesLabel, yesSkin, noLabel, noSkin } = options;
  UIController.openConfirmDialog({
    question,
    note,
    yesLabel,
    yesSkin,
    yesCallback: () => {
      webview.send(`confirm-yes${id ? `:${id}` : ''}`);
    },
    noLabel,
    noSkin,
    noCallback: () => {
      webview.send(`confirm-no${id ? `:${id}` : ''}`);
    },
  });
}

function handleIpcMessage(event) {
  switch (event.channel) {
    case 'rpc-call':
      rpcCall(event.args);
      break;
    case 'show-notification':
      showNotif(event.args);
      break;
    case 'show-error-dialog':
      showErrorDialog(event.args);
      break;
    case 'show-success-dialog':
      showSuccessDialog(event.args);
      break;
    case 'confirm': {
      confirm(event.args);
      break;
    }
  }
}

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
      webview.addEventListener('ipc-message', handleIpcMessage);
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
