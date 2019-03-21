// External
import React from 'react';
import { connect } from 'react-redux';

// Internal
import { getAllModules } from 'api/modules';
import SettingsContainer from 'components/SettingsContainer';
import Module from './Module';

@connect(state => ({
  modules: getAllModules(state.modules),
}))
class SettingsModules extends React.Component {
  render() {
    return (
      <SettingsContainer>
        {this.props.modules.map(module => (
          <Module key={module.name} module={module} />
        ))}
      </SettingsContainer>
    );
  }
}

export default SettingsModules;
