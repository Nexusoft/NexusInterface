// External
import React from 'react';
import { connect } from 'react-redux';
import { remote } from 'electron';

// Internal Global
import googleanalytics from 'scripts/googleanalytics';
import ContextMenuBuilder from 'contextmenu';
import { selectEnabledModules } from 'selectors';

// Internal Local
import PageModule from './PageModule';
import PagePanelModule from './PagePanelModule';

/**
 * Modules
 *
 * @class Modules
 * @extends {Component}
 */
@connect(state => ({
  modules: selectEnabledModules(state.modules),
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
    if (module && module.type === 'page') {
      return <PageModule module={module} />;
    } else if (module && module.type === 'page-panel') {
      return <PagePanelModule module={module} />;
    } else {
      return null;
    }
  }
}

export default Modules;
