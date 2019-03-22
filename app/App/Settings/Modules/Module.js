// External
import React from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

// Internal
import ModuleIcon from 'components/ModuleIcon';
import Switch from 'components/Switch';
import Tooltip from 'components/Tooltip';
import UIController from 'components/UIController';
import { isModuleActive } from 'api/modules';
import { lighten } from 'utils/color';
import { updateSettings } from 'actions/settingsActionCreators';

const ModuleComponent = styled.div(({ theme }) => ({
  display: 'grid',
  gridTemplateAreas: '"logo info controls"',
  gridTemplateColumns: 'min-content 1fr min-content',
  columnGap: '1em',
  alignItems: 'center',
  padding: '1em 0',
  borderBottom: `1px solid ${theme.mixer(0.125)}`,
}));

const ModuleLogo = styled.div({
  fontSize: '2em',
});

const ModuleInfo = styled.div({
  gridArea: 'info',
});

const ModuleControls = styled.div({
  gridArea: 'controls',
});

const ModuleName = styled.span(({ theme }) => ({
  color: theme.foreground,
}));

const ModuleVersion = styled.span(({ theme }) => ({
  color: theme.mixer(0.75),
  fontSize: '.9em',
  marginLeft: '.7em',
}));

const ModuleDescription = styled.div(({ theme }) => ({
  color: theme.mixer(0.75),
  fontSize: '.9em',
}));

const ModuleError = styled.div(({ theme }) => ({
  color: lighten(theme.danger, 0.2),
  fontSize: '.9em',
}));

const mapStateToProps = (state, props) => ({
  active: isModuleActive(props.module, state.settings.disabledModules),
  disabledModules: state.settings.disabledModules,
});

const actionCreators = {
  updateSettings,
};

@connect(
  mapStateToProps,
  actionCreators
)
class Module extends React.Component {
  enableModule = () => {
    this.props.updateSettings({
      disabledModules: this.props.disabledModules.filter(
        moduleName => moduleName !== this.props.module.name
      ),
    });
  };

  disableModule = () => {
    this.props.updateSettings({
      disabledModules: [...this.props.disabledModules, this.props.module.name],
    });
  };

  toggleModule = () => {
    const { module, active } = this.props;
    if (module.invalid) return;
    if (active) {
      UIController.openConfirmDialog({
        question: `Disable ${module.displayName}?`,
        note:
          'Wallet will be automatically refreshed for the change to take effect',
        yesCallback: () => {
          this.disableModule();
          document.location.reload();
        },
      });
    } else {
      UIController.openConfirmDialog({
        question: `Enable ${module.displayName}?`,
        note:
          'Wallet will be automatically refreshed for the change to take effect',
        yesCallback: () => {
          this.enableModule();
          document.location.reload();
        },
      });
    }
  };

  render() {
    const { module, active } = this.props;
    return (
      <ModuleComponent>
        <ModuleLogo className={module.invalid ? 'dim' : undefined}>
          <ModuleIcon module={module} />
        </ModuleLogo>

        <ModuleInfo>
          <div className={module.invalid ? 'dim' : undefined}>
            <ModuleName>{module.displayName}</ModuleName>
            <ModuleVersion>v{module.version}</ModuleVersion>
          </div>
          <div>
            <ModuleDescription className={module.invalid ? 'dim' : undefined}>
              {module.description}
            </ModuleDescription>
          </div>
          {!!module.deprecated && (
            <ModuleError>Deprecated API version</ModuleError>
          )}
          {(!module.repository || !module.repoOnline) && (
            <ModuleError>Module is not open source.</ModuleError>
          )}
          {!!module.repository && !module.repoVerified && (
            <ModuleError>
              Module is not verified that it matches the source code.
            </ModuleError>
          )}
        </ModuleInfo>

        <ModuleControls>
          <Tooltip.Trigger
            tooltip={!module.invalid && (active ? 'Enabled' : 'Disabled')}
          >
            <Switch
              checked={active}
              onChange={this.toggleModule}
              disabled={module.invalid}
            />
          </Tooltip.Trigger>
        </ModuleControls>
      </ModuleComponent>
    );
  }
}

export default Module;
