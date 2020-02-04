// External
import React from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

// Internal
import ModuleIcon from 'components/ModuleIcon';
import Switch from 'components/Switch';
import Tooltip from 'components/Tooltip';
import Icon from 'components/Icon';
import { openConfirmDialog, openModal } from 'lib/ui';
import ModuleDetailsModal from 'components/ModuleDetailsModal';
import { isModuleEnabled } from 'lib/modules';
import { timing } from 'styles';
import { updateSettings } from 'lib/settings';
import warningIcon from 'icons/warning.svg';

__ = __context('Settings.Modules');

const ModuleComponent = styled.div(
  ({ theme }) => ({
    display: 'grid',
    gridTemplateAreas: '"logo info controls"',
    gridTemplateColumns: 'min-content 1fr min-content',
    columnGap: '1em',
    alignItems: 'center',
    padding: '1em 0',
    borderBottom: `1px solid ${theme.mixer(0.125)}`,
    opacity: 0.8,
    transition: `opacity ${timing.normal}`,
    '&:hover': {
      opacity: 1,
    },
  }),
  ({ last }) =>
    last && {
      borderBottom: 'none',
    }
);

const ModuleLogo = styled.div({
  fontSize: '2em',
  cursor: 'pointer',
});

const ModuleInfo = styled.div({
  gridArea: 'info',
  cursor: 'pointer',
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

const mapStateToProps = (state, props) => ({
  enabled: isModuleEnabled(props.module),
  disabledModules: state.settings.disabledModules,
});

/**
 * Each Module On the list of installed modules
 *
 * @class Module
 * @extends {React.Component}
 */
@connect(mapStateToProps)
class Module extends React.Component {
  /**
   * Enable this module
   *
   * @memberof Module
   */
  enableModule = () => {
    updateSettings({
      disabledModules: this.props.disabledModules.filter(
        moduleName => moduleName !== this.props.module.name
      ),
    });
  };

  /**
   * Disable this module
   *
   * @memberof Module
   */
  disableModule = () => {
    updateSettings({
      disabledModules: [...this.props.disabledModules, this.props.module.name],
    });
  };

  /**
   * Toggle Module on or off
   *
   * @memberof Module
   */
  toggleModule = () => {
    const { module, enabled } = this.props;
    if (module.disallowed) return;
    if (enabled) {
      openConfirmDialog({
        question: __('Disable %{moduleName}?', {
          moduleName: module.displayName,
        }),
        note: __(
          'Wallet will be automatically refreshed for the change to take effect'
        ),
        callbackYes: () => {
          this.disableModule();
          document.location.reload();
        },
      });
    } else {
      openConfirmDialog({
        question: __('Enable %{moduleName}?', {
          moduleName: module.displayName,
        }),
        note: __(
          'Wallet will be automatically refreshed for the change to take effect'
        ),
        callbackYes: () => {
          this.enableModule();
          document.location.reload();
        },
      });
    }
  };

  /**
   * Open the details modal for the module
   *
   * @memberof Module
   */
  openModuleDetails = () => {
    openModal(ModuleDetailsModal, {
      module: this.props.module,
    });
  };

  /**
   * Component's Renderable JSX
   *
   * @returns {JSX}
   * @memberof Module
   */
  render() {
    const { module, enabled, ...rest } = this.props;
    return (
      <ModuleComponent {...rest}>
        <ModuleLogo
          className={module.disallowed ? 'dim' : undefined}
          onClick={this.openModuleDetails}
        >
          <ModuleIcon module={module} />
        </ModuleLogo>

        <ModuleInfo onClick={this.openModuleDetails}>
          <div className={module.disallowed ? 'dim' : undefined}>
            <ModuleName>{module.displayName}</ModuleName>
            <ModuleVersion>v{module.version}</ModuleVersion>
            <span className="error">
              {!!module.incompatible && (
                <Tooltip.Trigger
                  tooltip={__(
                    'The wallet version this module was built on is no longer compatible'
                  )}
                >
                  <Icon icon={warningIcon} className="space-left" />
                </Tooltip.Trigger>
              )}
              {(!module.repository || !module.repoOnline) && (
                <Tooltip.Trigger tooltip={__('Module is not open source')}>
                  <Icon icon={warningIcon} className="space-left" />
                </Tooltip.Trigger>
              )}
              {!!module.repository && !module.repoVerified && (
                <Tooltip.Trigger
                  tooltip={__(
                    'The provided repository is not verified to be the real source code of this module'
                  )}
                >
                  <Icon icon={warningIcon} className="space-left" />
                </Tooltip.Trigger>
              )}
            </span>
          </div>
          <div>
            <ModuleDescription
              className={module.disallowed ? 'dim' : undefined}
            >
              {module.description}
            </ModuleDescription>
          </div>
        </ModuleInfo>

        <ModuleControls>
          <Tooltip.Trigger
            tooltip={!module.disallowed && (enabled ? 'Enabled' : 'Disabled')}
          >
            <Switch
              checked={enabled}
              onChange={this.toggleModule}
              disabled={module.disallowed}
            />
          </Tooltip.Trigger>
        </ModuleControls>
      </ModuleComponent>
    );
  }
}

export default Module;
