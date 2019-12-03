// External
import React from 'react';
import { connect } from 'react-redux';

// Internal
import { getAllModules } from 'lib/modules';
import { switchSettingsTab } from 'lib/ui';
import Module from './Module';
import AddModule from './AddModule';

__ = __context('Settings.Modules');

/**
 * The Module's Settings Page
 *
 * @class SettingsModules
 * @extends {React.Component}
 */
@connect(state => ({
  modules: getAllModules(state.modules),
}))
class SettingsModules extends React.Component {
  /**
   *Creates an instance of SettingsModules.
   * @param {*} props
   * @memberof SettingsModules
   */
  constructor(props) {
    super(props);
    switchSettingsTab('Modules');
  }

  /**
   * Component's Renderable JSX
   *
   * @returns {JSX}
   * @memberof SettingsModules
   */
  render() {
    return (
      <>
        <AddModule />
        {this.props.modules.map((module, i) => (
          <Module
            key={module.name}
            module={module}
            last={i === this.props.modules.length - 1}
          />
        ))}
      </>
    );
  }
}

export default SettingsModules;
