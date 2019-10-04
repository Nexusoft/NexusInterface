// External
import React from 'react';
import { connect } from 'react-redux';
import { remote } from 'electron';

// Internal Global
import GA from 'lib/googleAnalytics';
import ContextMenuBuilder from 'contextmenu';
import { getModuleIfEnabled } from 'lib/modules';

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
  module: getModuleIfEnabled(
    props.match.params.name,
    state.modules,
    state.settings.disabledModules
  ),
}))
class Modules extends React.Component {
  /**
   * Component Mount Callback
   *
   * @memberof Modules
   */
  componentDidMount() {
    window.addEventListener('contextmenu', this.setupcontextmenu, false);
    GA.SendScreen('Module');
  }

  /**
   * Component Unmount Callback
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
   * Component's Renderable JSX
   *
   * @returns
   * @memberof Modules
   */
  render() {
    const { module } = this.props;
    if (!module || module.type !== 'app') return null;

    if (module.options && module.options.wrapInPanel) {
      return <PagePanelModule module={module} />;
    } else {
      return <PageModule module={module} />;
    }
  }
}

export default Modules;
