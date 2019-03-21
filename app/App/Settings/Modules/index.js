// External
import React from 'react';
import { connect } from 'react-redux';

// Internal
import { selectAllModules } from 'selectors';
import SettingsContainer from 'components/SettingsContainer';
import Module from './Module';

@connect(state => ({
  modules: selectAllModules(state.modules),
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
