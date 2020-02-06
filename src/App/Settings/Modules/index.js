// External
import React from 'react';
import { connect } from 'react-redux';

// Internal
import { switchSettingsTab } from 'lib/ui';
import Module from './Module';
import AddModule from './AddModule';
import AddDevModule from './AddDevModule';

__ = __context('Settings.Modules');

/**
 * The Module's Settings Page
 *
 * @class SettingsModules
 * @extends {React.Component}
 */
@connect(state => ({
  modules: state.modules,
  devMode: state.settings.devMode,
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
    const list = Object.values(this.props.modules);
    return (
      <>
        <AddModule />
        {this.props.devMode && <AddDevModule />}
        {list.map((module, i) => (
          <Module
            key={module.info.name}
            module={module}
            last={i === list.length - 1}
          />
        ))}
      </>
    );
  }
}

export default SettingsModules;
