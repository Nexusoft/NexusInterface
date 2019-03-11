// External
import React from 'react';
import { connect } from 'react-redux';
import { remote } from 'electron';
import { existsSync } from 'fs';
import { join } from 'path';

// Internal Global
import googleanalytics from 'scripts/googleanalytics';
import ContextMenuBuilder from 'contextmenu';
import config from 'api/configuration';

/**
 * Modules
 *
 * @class Modules
 * @extends {Component}
 */
@connect(state => ({
  modules: state.modules,
}))
class Modules extends React.Component {
  /**
   *
   *
   * @memberof Modules
   */
  componentDidMount() {
    window.addEventListener('contextmenu', this.setupcontextmenu, false);
    googleanalytics.SendScreen('Module');
  }

  /**
   *
   *
   * @memberof Modules
   */
  componentWillUnmount() {
    window.removeEventListener('contextmenu', this.setupcontextmenu);
  }

  /**
   * Set up the context menu
   *
   * @param {*} e
   * @memberof Modules
   */
  setupcontextmenu(e) {
    e.preventDefault();
    const contextmenu = new ContextMenuBuilder().defaultContext;
    //build default
    let defaultcontextmenu = remote.Menu.buildFromTemplate(contextmenu);
    defaultcontextmenu.popup(remote.getCurrentWindow());
  }

  /**
   *
   *
   * @returns
   * @memberof Modules
   */
  render() {
    const { modules, match } = this.props;
    const module = modules[match.params.name];
    if (!module || module.type !== 'page') return null;

    const entry = module.entry || 'index.html';
    const entryPath = join(config.GetModulesDir(), module.dirName, entry);
    if (!existsSync(entryPath)) return null;

    return (
      <webview
        key={module.name}
        src={entryPath}
        preload={`file://${__dirname}/module_preload.js`}
        nodeintegration="false"
        enableremotemodule="false"
        plugins="false"
        disablewebsecurity="false"
        style={{ width: '100%', height: '100%' }}
      />
    );
  }
}

export default Modules;
