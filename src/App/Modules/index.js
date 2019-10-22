// External
import React from 'react';
import { connect } from 'react-redux';

// Internal Global
import GA from 'lib/googleAnalytics';
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
    GA.SendScreen('Module');
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
