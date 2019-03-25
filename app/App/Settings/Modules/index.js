// External
import React from 'react';
import { connect } from 'react-redux';

// Internal
import { getAllModules } from 'api/modules';
import { switchSettingsTab } from 'actions/uiActionCreators';
import SettingsContainer from 'components/SettingsContainer';
import Module from './Module';
import AddModule from './AddModule';

@connect(
  state => ({
    modules: getAllModules(state.modules),
  }),
  { switchSettingsTab }
)
class SettingsModules extends React.Component {
  constructor(props) {
    super(props);
    props.switchSettingsTab('Modules');
  }

  render() {
    return (
      <SettingsContainer>
        <AddModule />
        {this.props.modules.map(module => (
          <Module key={module.name} module={module} />
        ))}
      </SettingsContainer>
    );
  }
}

export default SettingsModules;
