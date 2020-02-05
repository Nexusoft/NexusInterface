// External
import React from 'react';
import { connect } from 'react-redux';

// Internal Global
import GA from 'lib/googleAnalytics';

// Internal Local
import AppModule from './AppModule';
import WrappedAppModule from './WrappedAppModule';

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
    const { modules, match } = this.props;
    const module = modules[match.params.name];
    if (!module || module.info.type !== 'app' || !module.enabled) return null;

    if (module.info.options && module.info.options.wrapInPanel) {
      return <WrappedAppModule module={module} />;
    } else {
      return <AppModule module={module} />;
    }
  }
}

export default Modules;
