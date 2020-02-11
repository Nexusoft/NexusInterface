// External
import React from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';
import { shell } from 'electron';

// Internal
import { switchSettingsTab } from 'lib/ui';
import { timing } from 'styles';
import Tooltip from 'components/Tooltip';

import Module from './Module';
import AddModule from './AddModule';
import AddDevModule from './AddDevModule';

__ = __context('Settings.Modules');

const FailedModules = styled.div(({ theme }) => ({
  borderTop: `1px solid ${theme.mixer(0.125)}`,
  marginTop: '2em',
}));

const FailedModule = styled.div(({ theme }) => ({
  padding: '1em 0',
  fontSize: '.9em',
  color: theme.mixer(0.75),
  cursor: 'pointer',
  opacity: 0.8,
  transition: `opacity ${timing.normal}`,
  '&:hover': {
    opacity: 1,
  },
}));

/**
 * The Module's Settings Page
 *
 * @class SettingsModules
 * @extends {React.Component}
 */
@connect(state => ({
  modules: state.modules,
  failedModules: state.failedModules,
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
    const { modules, devMode, failedModules } = this.props;
    const list = Object.values(modules);
    return (
      <>
        <AddModule />
        {devMode && <AddDevModule />}
        {list.map((module, i) => (
          <Module
            key={module.info.name}
            module={module}
            last={i === list.length - 1}
          />
        ))}
        {!!failedModules && (
          <FailedModules>
            {failedModules.map(({ name, path, message }) => (
              <FailedModule
                key={name}
                onClick={() => {
                  shell.openItem(path);
                }}
              >
                <Tooltip.Trigger tooltip={message}>
                  <span>
                    {__('Failed to load %{moduleName}', { moduleName: name })}
                  </span>
                </Tooltip.Trigger>
              </FailedModule>
            ))}
          </FailedModules>
        )}
      </>
    );
  }
}

export default SettingsModules;
