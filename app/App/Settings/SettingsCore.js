// External Dependencies
import React, { Component } from 'react';
import { remote } from 'electron';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import styled from '@emotion/styled';

// Internal Dependencies
import { GetSettings, SaveSettings } from 'api/settings.js';
import core from 'api/core';
import * as TYPE from 'actions/actiontypes';
import * as RPC from 'scripts/rpc';
import SettingsField from 'components/SettingsField';
import Button from 'components/Button';
import TextField from 'components/TextField';
import Switch from 'components/Switch';
import UIController from 'components/UIController';

const CoreSettings = styled.div({
  maxWidth: 750,
  margin: '0 auto',
});

// React-Redux mandatory methods
const mapStateToProps = state => {
  return {
    ...state.common,
    ...state.settings,
    ...state.intl,
  };
};
const mapDispatchToProps = dispatch => ({
  setSettings: settings => {
    dispatch({ type: TYPE.GET_SETTINGS, payload: settings });
  },
  OpenModal: type => {
    dispatch({ type: TYPE.SHOW_MODAL, payload: type });
  },
  OpenModal2: type => {
    dispatch({ type: TYPE.SHOW_MODAL2, payload: type });
  },
  OpenModal3: type => {
    dispatch({ type: TYPE.SHOW_MODAL3, payload: type });
  },
  CloseModal2: type => {
    dispatch({ type: TYPE.HIDE_MODAL2, payload: type });
  },
  CloseModal3: type => {
    dispatch({ type: TYPE.HIDE_MODAL3, payload: type });
  },
  clearForRestart: () => {
    dispatch({ type: TYPE.CLEAR_FOR_RESTART });
  },
  CloseModal: () => {
    dispatch({ type: TYPE.HIDE_MODAL });
  },
  CloseManualDaemonModal: () => {
    dispatch({ type: TYPE.CLOSE_MANUAL_DAEMON_MODAL });
  },
  OpenManualDaemonModal: () => {
    dispatch({ type: TYPE.OPEN_MANUAL_DAEMON_MODAL });
  },
  updateManualDaemonSetting: bool => {
    dispatch({ type: TYPE.UPDATE_MANUAL_DAEMON_SETTINGS, payload: bool });
  },
  clearOverviewVariables: () => {
    dispatch({ type: TYPE.CLEAR_FOR_BOOTSTRAPING });
  },
});

class SettingsCore extends Component {
  // React Method (Life cycle hook)
  constructor(props) {
    super(props);
    // Set initial settings
    // This is a temporary fix for the current setting state mechanism
    // Ideally this should be managed via Redux states & actions
    const settings = GetSettings();
    this.initialValues = {
      manualDaemon: !!settings.manualDaemon,
      manualDaemonUser: settings.manualDaemonUser || 'rpcserver',
      manualDaemonPassword: settings.manualDaemonPassword || 'password',
      manualDaemonIP: settings.manualDaemonIP || '127.0.0.1',
      manualDaemonPort: settings.manualDaemonPort || '9336',
      manualDaemonDataDir:
        settings.manualDaemonDataDir || '.Nexus_Core_Data_BETA_v0.8.4',
      enableMining: !!settings.enableMining,
      enableStaking: !!settings.enableStaking,
      verboseLevel: settings.verboseLevel || '2',
      forkblocks: settings.forkblocks || '0',
      mapPortUsingUpnp: !!settings.mapPortUsingUpnp,
      socks4Proxy: !!settings.socks4Proxy,
      socks4ProxyIP: settings.socks4ProxyIP || '127.0.0.1',
      socks4ProxyPort: settings.socks4ProxyPort || '9050',
      detatchDatabaseOnShutdown: !!settings.detatchDatabaseOnShutdown,
    };

    this.state = {
      manualDaemon: this.initialValues.manualDaemon,
      socks4Proxy: this.initialValues.socks4Proxy,
    };
  }

  updateEnableMining(event) {
    var el = even.target;
    var settingsObj = GetSettings();

    settingsObj.enableMining = el.checked;

    SaveSettings(settingsObj);
  }

  updateEnableStaking(event) {
    var el = event.target;
    var settingsObj = GetSettings();

    settingsObj.enableStaking = el.checked;

    SaveSettings(settingsObj);
  }

  updateVerboseLevel(event) {
    var el = event.target;
    var settingsObj = GetSettings();

    settingsObj.verboseLevel = el.value;

    SaveSettings(settingsObj);
  }

  updateForkBlockAmout(event) {
    var el = event.target;
    var settingsObj = GetSettings();

    settingsObj.forkblocks = el.value;

    SaveSettings(settingsObj);
  }

  updateManualDaemon(manualDaemon) {
    var settingsObj = GetSettings();

    settingsObj.manualDaemon = manualDaemon;

    SaveSettings(settingsObj);
    this.setState({ manualDaemon });
  }

  updateManualDaemonUser(event) {
    var el = event.target;
    var settingsObj = GetSettings();

    settingsObj.manualDaemonUser = el.value;

    SaveSettings(settingsObj);
  }

  updateManualDaemonPassword(event) {
    var el = event.target;
    var settingsObj = GetSettings();

    settingsObj.manualDaemonPassword = el.value;

    SaveSettings(settingsObj);
  }

  updateManualDaemonIP(event) {
    var el = event.target;
    var settingsObj = GetSettings();

    settingsObj.manualDaemonIP = el.value;

    SaveSettings(settingsObj);
  }

  updateManualDaemonPort(event) {
    var el = event.target;
    var settingsObj = GetSettings();

    settingsObj.manualDaemonPort = el.value;

    SaveSettings(settingsObj);
  }

  updateManualDaemonDataDir(event) {
    var el = event.target;
    var settingsObj = GetSettings();

    settingsObj.manualDaemonDataDir = el.value;

    SaveSettings(settingsObj);
  }

  updateMapPortUsingUpnp(event) {
    var el = event.target;
    var settingsObj = GetSettings();

    settingsObj.mapPortUsingUpnp = el.checked;

    SaveSettings(settingsObj);
  }

  updateSocks4Proxy(event) {
    var el = event.target;
    console.log('socks4Proxy', el.checked);
    var settingsObj = GetSettings();

    settingsObj.socks4Proxy = el.checked;

    SaveSettings(settingsObj);

    this.setState({
      socks4Proxy: el.checked,
    });
  }

  updateSocks4ProxyIP(event) {
    var el = event.target;
    var settingsObj = GetSettings();

    settingsObj.socks4ProxyIP = el.value;

    SaveSettings(settingsObj);
  }

  updateSocks4ProxyPort(event) {
    var el = event.target;
    var settingsObj = GetSettings();

    settingsObj.socks4ProxyPort = el.value;

    SaveSettings(settingsObj);
  }

  updateDetatchDatabaseOnShutdown(event) {
    var el = event.target;
    var settingsObj = GetSettings();
    settingsObj.detatchDatabaseOnShutdown = el.checked;

    SaveSettings(settingsObj);
  }

  coreRestart() {
    core.restart();
  }

  confirmSwitchManualDaemon = () => {
    if (this.props.settings.manualDaemon) {
      UIController.openConfirmModal({
        question: (
          <FormattedMessage
            id="Settings.ManualDaemonExit"
            defaultMessage="Exit manual daemon mode?"
          />
        ),
        note: (
          <FormattedMessage
            id="Settings.ManualDaemonWarning"
            defaultMessage="(This will shut down your daemon)"
          />
        ),
        yesCallback: () => {
          RPC.PROMISE('stop', [])
            .then(payload => {
              this.props.updateManualDaemonSetting(false);
              this.updateManualDaemon(false);
              this.props.clearForRestart();
              remote.getGlobal('core').start();
            })
            .catch(e => {
              this.props.updateManualDaemonSetting(false);
              this.updateManualDaemon(false);
              this.props.clearForRestart();
              remote.getGlobal('core').start();
            });
        },
      });
    } else {
      UIController.openConfirmModal({
        question: (
          <FormattedMessage
            id="Settings.ManualDaemonEntry"
            defaultMessage="Enter manual daemon mode?"
          />
        ),
        note: (
          <FormattedMessage
            id="Settings.ManualDaemonWarning"
            defaultMessage="(This will shut down your daemon)"
          />
        ),
        yesCallback: () => {
          RPC.PROMISE('stop', [])
            .then(payload => {
              remote.getGlobal('core').stop();
              this.props.updateManualDaemonSetting(true);
              this.updateManualDaemon(true);
            })
            .catch(e => {
              remote.getGlobal('core').stop();
              this.props.updateManualDaemonSetting(true);
              this.updateManualDaemon(true);
            });
        },
      });
    }
  };

  confirmSaveSettings = () => {
    UIController.openConfirmModal({
      question: (
        <>
          <FormattedMessage id="SaveSettings" defaultMessage="Save Settings" />?
        </>
      ),
      note: (
        <FormattedMessage
          id="Settings.ChangesNexTime"
          defaultMessage="Changes to core settings will take effect the next time the core is restarted"
        />
      ),
      yesCallback: () => {
        this.props.setSettings(GetSettings());
        UIController.showNotification(
          <FormattedMessage
            id="Alert.CoreSettingsSaved"
            defaultMessage="Core Settings Saved"
          />,
          'success'
        );
      },
    });
  };

  render() {
    return (
      <CoreSettings>
        <form>
          <SettingsField
            connectLabel
            label={
              <FormattedMessage
                id="Settings.EnableMining"
                defaultMessage="Enable Mining"
              />
            }
            subLabel={
              <FormattedMessage
                id="ToolTip.EnableMining"
                defaultMessage="Enable/Disable mining to the wallet"
              />
            }
          >
            <Switch
              defaultChecked={this.initialValues.enableMining}
              onChange={this.updateEnableMining}
            />
          </SettingsField>

          <SettingsField
            connectLabel
            label={
              <FormattedMessage
                id="Settings.EnableStaking"
                defaultMessage="Enable Staking"
              />
            }
            subLabel={
              <FormattedMessage
                id="ToolTip.EnableStaking"
                defaultMessage="Enable/Disable Staking to the wallet"
              />
            }
          >
            <Switch
              defaultChecked={this.initialValues.enableStaking}
              onChange={this.updateEnableStaking}
            />
          </SettingsField>

          <SettingsField
            connectLabel
            label={
              <FormattedMessage
                id="Settings.VerboseLevel"
                defaultMessage="Verbose Level"
              />
            }
            subLabel={
              <FormattedMessage
                id="ToolTip.Verbose"
                defaultMessage="Verbose level for logs"
              />
            }
          >
            <TextField
              defaultValue={this.initialValues.verboseLevel}
              size={3}
              onChange={this.updateVerboseLevel}
            />
          </SettingsField>

          <SettingsField
            connectLabel
            label={
              <FormattedMessage
                id="Settings.ManualDaemonMode"
                defaultMessage="Manual Daemon Mode"
              />
            }
            subLabel={
              <FormattedMessage
                id="ToolTip.MDM"
                defaultMessage="Enable manual daemon mode if you are running the daemon manually outside of the wallet"
              />
            }
          >
            <Switch
              checked={this.props.settings.manualDaemon}
              onChange={this.confirmSwitchManualDaemon}
            />
          </SettingsField>

          <div style={{ display: this.state.manualDaemon ? 'block' : 'none' }}>
            <SettingsField
              indent={1}
              connectLabel
              label={
                <FormattedMessage
                  id="Settings.Username"
                  defaultMesage="Username"
                />
              }
              subLabel={
                <FormattedMessage
                  id="ToolTip.UserName"
                  defaultMessage="Username configured for manual daemon"
                />
              }
            >
              <TextField
                defaultValue={this.initialValues.manualDaemonUser}
                size="12"
                onChange={this.updateManualDaemonUser}
              />
            </SettingsField>

            <SettingsField
              indent={1}
              connectLabel
              label={
                <FormattedMessage
                  id="Settings.Password"
                  defaultMesage="Password"
                />
              }
              subLabel={
                <FormattedMessage
                  id="ToolTip.Password"
                  defaultMessage="Password configured for manual daemon"
                />
              }
            >
              <TextField
                defaultValue={this.initialValues.manualDaemonPassword}
                size="12"
                onChange={this.updateManualDaemonPassword}
              />
            </SettingsField>

            <SettingsField
              indent={1}
              connectLabel
              label={
                <FormattedMessage
                  id="Settings.IpAddress"
                  defaultMesage="IP Address"
                />
              }
              subLabel={
                <FormattedMessage
                  id="ToolTip.IP"
                  defaultMessage="IP address configured for manual daemon"
                />
              }
            >
              <TextField
                defaultValue={this.initialValues.manualDaemonIP}
                size="12"
                onChange={this.updateManualDaemonIP}
              />
            </SettingsField>

            <SettingsField
              indent={1}
              connectLabel
              label={
                <FormattedMessage id="Settings.Port" defaultMesage="Port" />
              }
              subLabel={
                <FormattedMessage
                  id="ToolTip.PortConfig"
                  defaultMessage="Port configured for manual daemon"
                />
              }
            >
              <TextField
                defaultValue={this.initialValues.manualDaemonPort}
                size="5"
                onChange={this.updateManualDaemonPort}
              />
            </SettingsField>
          </div>

          <div style={{ display: this.state.manualDaemon ? 'none' : 'block' }}>
            <SettingsField
              indent={1}
              connectLabel
              label={
                <FormattedMessage
                  id="Settings.UPnp"
                  defaultMesage="Map port using UPnP"
                />
              }
              subLabel={
                <FormattedMessage
                  id="ToolTip.UPnP"
                  defaultMessage="Automatically open the Nexus client port on the router. This only works when your router supports UPnP and it is enabled."
                />
              }
            >
              <Switch
                defaultChecked={this.initialValues.mapPortUsingUpnp}
                onChange={this.updateMapPortUsingUpnp}
              />
            </SettingsField>
            <SettingsField
              indent={1}
              connectLabel
              label={
                <FormattedMessage
                  id="Settings.Socks4proxy"
                  defaultMesage="Connect through SOCKS4 proxy"
                />
              }
              subLabel={
                <FormattedMessage
                  id="ToolTip.Socks4"
                  defaultMessage="Connect to Nexus through a SOCKS4 proxy"
                />
              }
            >
              <Switch
                defaultChecked={this.initialValues.socks4Proxy}
                onChange={this.updateSocks4Proxy.bind(this)}
              />
            </SettingsField>

            <div style={{ display: this.state.socks4Proxy ? 'block' : 'none' }}>
              <SettingsField
                indent={2}
                connectLabel
                label={
                  <FormattedMessage
                    id="Settings.ProxyIP"
                    defaultMesage="Proxy IP Address"
                  />
                }
                subLabel={
                  <FormattedMessage
                    id="ToolTip.IPAddressofSOCKS4proxy"
                    defaultMessage="IP Address of SOCKS4 proxy server"
                  />
                }
              >
                <TextField
                  defaultValue={this.initialValues.socks4ProxyIP}
                  size="12"
                  onChange={this.updateSocks4ProxyIP}
                />
              </SettingsField>
              <SettingsField
                indent={2}
                connectLabel
                label={
                  <FormattedMessage
                    id="Settings.ProxyPort"
                    defaultMesage="Proxy Port"
                  />
                }
                subLabel={
                  <FormattedMessage
                    id="ToolTip.PortOfSOCKS4proxyServer"
                    defaultMessage="Port of SOCKS4 proxy server"
                  />
                }
              >
                <TextField
                  defaultValue={this.initialValues.socks4ProxyPort}
                  size="3"
                  onChange={this.updateSocks4ProxyPort}
                />
              </SettingsField>
            </div>
            <SettingsField
              indent={1}
              connectLabel
              label={
                <FormattedMessage
                  id="Settings.ProxyIP"
                  defaultMesage="Proxy IP Address"
                />
              }
              subLabel={
                <FormattedMessage
                  id="ToolTip.Detach"
                  defaultMessage="Detach the database when shutting down the wallet"
                />
              }
            >
              <Switch
                defaultChecked={this.initialValues.detatchDatabaseOnShutdown}
                onChange={this.updateDetatchDatabaseOnShutdown}
              />
            </SettingsField>
            <SettingsField
              indent={1}
              connectLabel
              label={
                <FormattedMessage
                  id="Settings.DDN"
                  defaultMessage="Data Directory Name"
                />
              }
              subLabel={
                <FormattedMessage
                  id="ToolTip.DataDirectory"
                  defaultMessage="Data directory configured for manual daemon"
                />
              }
            >
              <TextField
                size={30}
                defaultValue={this.initialValues.manualDaemonDataDir}
                onChange={this.updateManualDaemonDataDir}
              />
            </SettingsField>
          </div>

          <div className="flex space-between" style={{ marginTop: '2em' }}>
            <Button
              onClick={e => {
                e.preventDefault();
                this.props.clearForRestart();

                core.restart();
                UIController.showNotification(
                  <FormattedMessage
                    id="Alert.CoreRestarting"
                    defaultMessage="Core Restarting"
                  />
                );
              }}
            >
              <FormattedMessage
                id="Settings.RestartCore"
                defaultMesage="Restart Core"
              />
            </Button>
            <Button
              skin="primary"
              onClick={this.confirmSaveSettings}
              style={{ marginLeft: 15 }}
            >
              <FormattedMessage
                id="Settings.SaveSettings"
                defaultMessage="Save Settings"
              />
            </Button>
          </div>
        </form>
      </CoreSettings>
    );
  }
}

// Mandatory React-Redux method
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SettingsCore);
