// External
import React, { Component } from 'react';
import { remote } from 'electron';
import { connect } from 'react-redux';
import styled from '@emotion/styled';
import { reduxForm, Field } from 'redux-form';

// Internal
import core from 'api/core';
import * as TYPE from 'actions/actiontypes';
import * as RPC from 'scripts/rpc';
import Text from 'components/Text';
import WaitingMessage from 'components/WaitingMessage';
import SettingsField from 'components/SettingsField';
import Button from 'components/Button';
import TextField from 'components/TextField';
import Switch from 'components/Switch';
import UIController from 'components/UIController';
import { updateSettings } from 'actions/settingsActionCreators';
import { form } from 'utils';
import { rpcErrorHandler } from 'utils/form';
import FeeSetting from './FeeSetting';

const CoreSettings = styled.div({
  maxWidth: 750,
  margin: '0 auto',
});

// React-Redux mandatory methods
const mapStateToProps = ({ settings, overview: { connections } }) => ({
  connections,
  settings,
  initialValues: {
    manualDaemonUser: settings.manualDaemonUser,
    manualDaemonPassword: settings.manualDaemonPassword,
    manualDaemonIP: settings.manualDaemonIP,
    manualDaemonPort: settings.manualDaemonPort,
    manualDaemonDataDir: settings.manualDaemonDataDir,
    socks4ProxyIP: settings.socks4ProxyIP,
    socks4ProxyPort: settings.socks4ProxyPort,
  },
});
const mapDispatchToProps = dispatch => ({
  updateSettings: updates => dispatch(updateSettings(updates)),
  clearForRestart: () => {
    dispatch({ type: TYPE.CLEAR_FOR_RESTART });
  },
});

/**
 * Core Settings page that is inside Settings
 *
 * @class SettingsCore
 * @extends {Component}
 */
@connect(
  mapStateToProps,
  mapDispatchToProps
)
@reduxForm({
  form: 'coreSettings',
  destroyOnUnmount: false,
  validate: (
    {
      manualDaemonUser,
      manualDaemonPassword,
      manualDaemonIP,
      manualDaemonPort,
      manualDaemonDataDir,
      socks4ProxyIP,
      socks4ProxyPort,
    },
    props
  ) => {
    const errors = {};
    if (props.settings.manualDaemon) {
      if (!manualDaemonUser) {
        errors.manualDaemonUser = (
          <Text id="Settings.Errors.ManualDaemonUser" />
        );
      }
      if (!manualDaemonPassword) {
        errors.manualDaemonPassword = (
          <Text id="Settings.Errors.ManualDaemonPassword" />
        );
      }
      if (!manualDaemonIP) {
        errors.manualDaemonIP = <Text id="Settings.Errors.ManualDaemonIP" />;
      }
      if (!manualDaemonPort) {
        errors.manualDaemonPort = (
          <Text id="Settings.Errors.ManualDaemonPort" />
        );
      }
      if (!manualDaemonDataDir) {
        errors.manualDaemonDataDir = (
          <Text id="Settings.Errors.ManualDaemonDataDir" />
        );
      }
    } else if (props.settings.socks4Proxy) {
      if (!socks4ProxyIP) {
        errors.socks4ProxyIP = <Text id="Settings.Errors.Socks4PoxyIP" />;
      }
      if (!socks4ProxyPort) {
        errors.socks4ProxyPort = <Text id="Settings.Errors.Socks4PoxyPort" />;
      }
    }

    return errors;
  },
  onSubmit: (
    {
      manualDaemonUser,
      manualDaemonPassword,
      manualDaemonIP,
      manualDaemonPort,
      manualDaemonDataDir,
      socks4ProxyIP,
      socks4ProxyPort,
    },
    dispatch,
    props
  ) => {
    if (props.settings.manualDaemon) {
      props.updateSettings({
        manualDaemonUser,
        manualDaemonPassword,
        manualDaemonIP,
        manualDaemonPort,
        manualDaemonDataDir,
      });
    } else if (props.settings.socks4Proxy) {
      props.updateSettings({
        socks4ProxyIP,
        socks4ProxyPort,
      });
    }
  },
  onSubmitSuccess: () => {
    UIController.showNotification(
      <Text id="Alert.CoreSettingsSaved" />,
      'success'
    );
  },
  onSubmitFail: rpcErrorHandler('Error Saving Settings'),
})
class SettingsCore extends Component {
  /**
   * Confirms Switch to Manual Daemon
   *
   * @memberof SettingsCore
   */
  confirmSwitchManualDaemon = () => {
    if (this.props.settings.manualDaemon) {
      UIController.openConfirmDialog({
        question: <Text id="Settings.ManualDaemonExit" />,
        note: <Text id="Settings.ManualDaemonWarning" />,
        yesCallback: async () => {
          try {
            await RPC.PROMISE('stop', []);
          } finally {
            this.props.updateSettings({ manualDaemon: false });
            this.props.clearForRestart();
            remote.getGlobal('core').start();
          }
        },
      });
    } else {
      UIController.openConfirmDialog({
        question: <Text id="Settings.ManualDaemonEntry" />,
        note: <Text id="Settings.ManualDaemonWarning" />,
        yesCallback: async () => {
          try {
            await RPC.PROMISE('stop', []);
          } finally {
            remote.getGlobal('core').stop();
            this.props.updateSettings({ manualDaemon: true });
          }
        },
      });
    }
  };

  /**
   * Restarts Core
   *
   * @memberof SettingsCore
   */
  restartCore = () => {
    this.props.clearForRestart();
    core.restart();
    UIController.showNotification(<Text id="Alert.CoreRestarting" />);
  };

  updateHandlers = (() => {
    const handlers = [];
    return settingName => {
      if (!handlers[settingName]) {
        handlers[settingName] = input =>
          this.props.updateSettings({
            [settingName]: form.resolveValue(input),
          });
      }
      return handlers[settingName];
    };
  })();

  /**
   * React Render
   *
   * @returns
   * @memberof SettingsCore
   */
  render() {
    const {
      connections,
      handleSubmit,
      settings,
      pristine,
      submitting,
    } = this.props;

    if (connections !== undefined && !settings.manualDaemon) {
      return (
        <WaitingMessage>
          <Text id="transactions.Loading" />
          ...
        </WaitingMessage>
      );
    }

    return (
      <CoreSettings>
        <form onSubmit={handleSubmit}>
          <SettingsField
            connectLabel
            label={<Text id="Settings.EnableMining" />}
            subLabel={<Text id="ToolTip.EnableMining" />}
          >
            <Switch
              checked={settings.enableMining}
              onChange={this.updateHandlers('enableMining')}
            />
          </SettingsField>

          <SettingsField
            connectLabel
            label={<Text id="Settings.EnableStaking" />}
            subLabel={<Text id="ToolTip.EnableStaking" />}
          >
            <Switch
              checked={settings.enableStaking}
              onChange={this.updateHandlers('enableStaking')}
            />
          </SettingsField>

          <FeeSetting />

          <SettingsField
            connectLabel
            label={<Text id="Settings.VerboseLevel" />}
            subLabel={<Text id="ToolTip.Verbose" />}
          >
            <TextField
              type="number"
              value={settings.verboseLevel}
              onChange={this.updateHandlers('verboseLevel')}
              style={{ maxWidth: 50 }}
            />
          </SettingsField>

          <SettingsField
            connectLabel
            label={<Text id="Settings.ManualDaemonMode" />}
            subLabel={<Text id="ToolTip.MDM" />}
          >
            <Switch
              checked={settings.manualDaemon}
              onChange={this.confirmSwitchManualDaemon}
            />
          </SettingsField>

          <div style={{ display: settings.manualDaemon ? 'block' : 'none' }}>
            <SettingsField
              indent={1}
              connectLabel
              label={<Text id="Settings.Username" />}
              subLabel={<Text id="ToolTip.UserName" />}
            >
              <Field
                component={TextField.RF}
                name="manualDaemonUser"
                size="12"
              />
            </SettingsField>

            <SettingsField
              indent={1}
              connectLabel
              label={<Text id="Settings.Password" />}
              subLabel={<Text id="ToolTip.Password" />}
            >
              <Field
                component={TextField.RF}
                name="manualDaemonPassword"
                size="12"
              />
            </SettingsField>

            <SettingsField
              indent={1}
              connectLabel
              label={<Text id="Settings.IpAddress" />}
              subLabel={<Text id="ToolTip.IP" />}
            >
              <Field component={TextField.RF} name="manualDaemonIP" size="12" />
            </SettingsField>

            <SettingsField
              indent={1}
              connectLabel
              label={<Text id="Settings.Port" />}
              subLabel={<Text id="ToolTip.PortConfig" />}
            >
              <Field
                component={TextField.RF}
                name="manualDaemonPort"
                size="5"
              />
            </SettingsField>

            <SettingsField
              indent={1}
              connectLabel
              label={<Text id="Settings.DDN" />}
              subLabel={<Text id="ToolTip.DataDirectory" />}
            >
              <Field
                component={TextField.RF}
                name="manualDaemonDataDir"
                size={30}
              />
            </SettingsField>
          </div>

          <div style={{ display: settings.manualDaemon ? 'none' : 'block' }}>
            <SettingsField
              indent={1}
              connectLabel
              label={<Text id="Settings.UPnp" />}
              subLabel={<Text id="ToolTip.UPnP" />}
            >
              <Switch
                defaultChecked={settings.mapPortUsingUpnp}
                onChange={this.updateHandlers('mapPortUsingUpnp')}
              />
            </SettingsField>
            <SettingsField
              indent={1}
              connectLabel
              label={<Text id="Settings.Socks4proxy" />}
              subLabel={<Text id="ToolTip.Socks4" />}
            >
              <Switch
                defaultChecked={settings.socks4Proxy}
                onChange={this.updateHandlers('socks4Proxy')}
              />
            </SettingsField>

            <div style={{ display: settings.socks4Proxy ? 'block' : 'none' }}>
              <SettingsField
                indent={2}
                connectLabel
                label={<Text id="Settings.ProxyIP" />}
                subLabel={<Text id="ToolTip.IPAddressofSOCKS4proxy" />}
              >
                <Field
                  component={TextField.RF}
                  name="socks4ProxyIP"
                  size="12"
                />
              </SettingsField>
              <SettingsField
                indent={2}
                connectLabel
                label={<Text id="Settings.ProxyPort" />}
                subLabel={<Text id="ToolTip.PortOfSOCKS4proxyServer" />}
              >
                <Field
                  component={TextField.RF}
                  name="socks4ProxyPort"
                  size="3"
                />
              </SettingsField>
            </div>

            <SettingsField
              indent={1}
              connectLabel
              label={<Text id="Settings.Detach" />}
              subLabel={<Text id="ToolTip.Detach" />}
            >
              <Switch
                defaultChecked={settings.detatchDatabaseOnShutdown}
                onChange={this.updateHandlers('detatchDatabaseOnShutdown')}
              />
            </SettingsField>
          </div>

          <div className="flex space-between" style={{ marginTop: '2em' }}>
            <Button onClick={this.restartCore}>
              <Text id="Settings.RestartCore" />
            </Button>

            <Button
              type="submit"
              skin="primary"
              disabled={pristine || submitting}
            >
              {pristine ? (
                <Text id="Settings.SettingsSaved" />
              ) : submitting ? (
                <Text id="SavingSettings" />
              ) : (
                <Text id="SaveSettings" />
              )}
            </Button>
          </div>
        </form>
      </CoreSettings>
    );
  }
}
export default SettingsCore;