// External
import React from 'react';
import { connect } from 'react-redux';
import { remote } from 'electron';

// Internal Global
import googleanalytics from 'scripts/googleanalytics';
import ContextMenuBuilder from 'contextmenu';
import { getModuleIfActive } from 'api/modules';

// Internal Local
import PageModule from './PageModule';
import PagePanelModule from './PagePanelModule';

/**
 * Modules
 *
 * @class Modules
 * @extends {Component}
 */
@connect((state, props) => ({
  module: getModuleIfActive(
    props.match.params.name,
    state.modules,
    state.settings.disabledModules
  ),
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
    const { module } = this.props;

    switch (module && module.type) {
      case 'page':
        return <PageModule module={module} />;
      case 'page-panel':
        return <PagePanelModule module={module} />;
      default:
        return null;
    }
  }
}

export default Modules;
