// External
import React from 'react';
import { connect } from 'react-redux';
import { existsSync } from 'fs';
import { join } from 'path';
import urlJoin from 'url-join';
import { remote } from 'electron';

// Internal Global
import store from 'store';
import { updateModuleState } from 'actions/moduleActionCreators';
import config from 'api/configuration';
import UIController from 'components/UIController';
import * as RPC from 'scripts/rpc';

const fileServer = remote.getGlobal('fileServer');

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
      webview.send(`confirm-answer${id ? `:${id}` : ''}`, true);
    },
    noLabel,
    noSkin,
    noCallback: () => {
      webview.send(`confirm-answer${id ? `:${id}` : ''}`, false);
    },
  });
}

function updateState(moduleName, moduleState) {
  if (typeof moduleState === 'object') {
    store.dispatch(updateModuleState(moduleName, moduleState));
  } else {
    console.error(
      `Module ${moduleName} is trying to update its state to a non-object value ${moduleState}`
    );
  }
}

function handleIpcMessage(event, module) {
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
    case 'confirm':
      confirm(event.args);
      break;
    case 'update-state':
      updateState(module.name, event.args[0]);
      break;
  }
}

/**
 * WebView
 *
 * @class WebView
 * @extends {Component}
 */
@connect(({ theme, core, settings, moduleStates }, props) => ({
  theme,
  settings,
  coreInfo: core.info,
  difficulty: core.difficulty,
  moduleState: moduleStates[props.module.name],
}))
class WebView extends React.Component {
  webviewRef = React.createRef();

  constructor(props) {
    super(props);
    const { module } = this.props;
    const moduleFiles = module.files.map(file => join(module.dirName, file));
    fileServer.serveModuleFiles(moduleFiles);
  }

  componentDidMount() {
    const webview = this.webviewRef.current;
    if (webview) {
      webview.addEventListener('ipc-message', event =>
        handleIpcMessage(event, module)
      );
      webview.addEventListener('dom-ready', () => {
        webview.openDevTools();
        const {
          theme,
          coreInfo,
          difficulty,
          moduleState,
          settings: { locale, fiatCurrency, addressStyle },
        } = this.props;
        webview.send('initialize', {
          theme,
          coreInfo,
          difficulty,
          moduleState,
          settings: { locale, fiatCurrency, addressStyle },
        });
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

    const entryUrl = urlJoin(fileServer.domain, 'modules', module.name, entry);
    const env = process.env.NODE_ENV === 'development' ? 'dev' : 'prod';

    return (
      <webview
        className={className}
        style={style}
        ref={this.webviewRef}
        src={entryUrl}
        preload={`file://${__dirname}/dist/module_preload.${env}.js`}
      />
    );
  }
}

export default WebView;
