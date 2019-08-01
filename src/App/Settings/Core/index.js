// External
import React, { Component } from 'react';
import { remote } from 'electron';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import cpy from 'cpy';

// Internal
import { switchSettingsTab } from 'actions/ui';
import { stopCore, startCore, restartCore } from 'actions/core';
import WaitingMessage from 'components/WaitingMessage';
import SettingsField from 'components/SettingsField';
import Button from 'components/Button';
import TextField from 'components/TextField';
import Switch from 'components/Switch';
import { showNotification, openConfirmDialog } from 'actions/overlays';
import { updateSettings } from 'actions/settings';
import * as form from 'utils/form';
import { rpcErrorHandler } from 'utils/form';
import { isCoreConnected } from 'selectors';
import ReScanButton from './RescanButton.js';
import { coreDataDir } from 'consts/paths';

const mapStateToProps = state => {
  const { settings } = state;
  return {
    coreConnected: isCoreConnected(state),
    settings,
    initialValues: {
      manualDaemonUser: settings.manualDaemonUser,
      manualDaemonPassword: settings.manualDaemonPassword,
      manualDaemonIP: settings.manualDaemonIP,
      manualDaemonPort: settings.manualDaemonPort,
      manualDaemonDataDir: settings.manualDaemonDataDir,
    },
  };
};
const actionCreators = {
  updateSettings,
  switchSettingsTab,
  openConfirmDialog,
  showNotification,
  stopCore,
  startCore,
  restartCore,
};

/**
 * Core Settings page that is inside Settings
 *
 * @class SettingsCore
 * @extends {Component}
 */
@connect(
  mapStateToProps,
  actionCreators
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
    },
    props
  ) => {
    const errors = {};
    if (props.settings.manualDaemon) {
      if (!manualDaemonUser) {
        errors.manualDaemonUser = __('Manual Core username is required');
      }
      if (!manualDaemonPassword) {
        errors.manualDaemonPassword = __('Manual Core password is required');
      }
      if (!manualDaemonIP) {
        errors.manualDaemonIP = __('Manual Core IP is required');
      }
      if (!manualDaemonPort) {
        errors.manualDaemonPort = __('Manual Core port is required');
      }
      if (!manualDaemonDataDir) {
        errors.manualDaemonDataDir = __('Data directory is required');
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
    }
  },
  onSubmitSuccess: (result, dispatch, props) => {
    props.showNotification(__('Core settings saved'), 'success');
  },
  onSubmitFail: rpcErrorHandler('Error Saving Settings'),
})
class SettingsCore extends Component {
  /**
   *Creates an instance of SettingsCore.
   * @param {*} props
   * @memberof SettingsCore
   */
  constructor(props) {
    super(props);
    props.switchSettingsTab('Core');
    this.updateMining = this.updateMining.bind(this);
    this.updateStaking = this.updateStaking.bind(this);
  }

  /**
   * Confirms Switch to Manual Core
   *
   * @memberof SettingsCore
   */
  confirmSwitchManualDaemon = () => {
    const {
      settings,
      openConfirmDialog,
      stopCore,
      startCore,
      updateSettings,
    } = this.props;

    if (settings.manualDaemon) {
      openConfirmDialog({
        question: __('Exit manual Core mode?'),
        note: __('(This will restart your Core)'),
        callbackYes: async () => {
          try {
            await stopCore();
          } finally {
            updateSettings({ manualDaemon: false });
            await startCore();
          }
        },
      });
    } else {
      openConfirmDialog({
        question: __('Enter manual Core mode?'),
        note: __('(This will restart your Core)'),
        callbackYes: async () => {
          updateSettings({ manualDaemon: true });
          await stopCore();
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
    this.props.restartCore();
    this.props.showNotification(__('Core restarting'));
  };

  /**
   * Opens up a dialog to move the data directory
   *
   * @memberof SettingsCore
   */
  moveDataDir = () => {
    remote.dialog.showOpenDialog(
      {
        title: __('Select a directory'),
        defaultPath: this.props.backupDir,
        properties: ['openDirectory'],
      },
      folderPaths => {
        if (folderPaths && folderPaths.length > 0) {
          this.handleFileCopy(folderPaths[0]);
        }
      }
    );
  };

  /**
   * Runs the file copy script
   *
   * @param {*} newFolderDir
   * @memberof SettingsCore
   */
  async handleFileCopy(newFolderDir) {
    await cpy(coreDataDir, newFolderDir).on('progress', progress => {
      console.log(progress);
    });
  }

  updateStaking(input) {
    let value = form.resolveValue(input);
    this.props.openConfirmDialog({
      question: __('Restart Core?'),
      note: __(
        'This setting change will only take effect after Core is restarted. Do you want to restart the Core now?'
      ),
      labelYes: 'Restart now',
      labelNo: "I'll restart later",
      callbackYes: async () => {
        this.props.updateSettings({
          enableStaking: form.resolveValue(value),
        });
        this.restartCore();
      },
      callbackNo: () => {
        this.props.updateSettings({
          enableStaking: form.resolveValue(value),
        });
      },
    });
  }

  updateMining(input) {
    let value = form.resolveValue(input);
    this.props.openConfirmDialog({
      question: __('Restart Core?'),
      note: __(
        'This setting change will only take effect after Core is restarted. Do you want to restart the Core now?'
      ),
      labelYes: 'Restart now',
      labelNo: "I'll restart later",
      callbackYes: async () => {
        this.props.updateSettings({
          enableMining: form.resolveValue(value),
        });
        this.restartCore();
      },
      callbackNo: () => {
        this.props.updateSettings({
          enableMining: form.resolveValue(value),
        });
      },
    });
  }

  /**
   * Sets the list of IPs that the daemon will send coin to when it mines.
   *
   * @param {*} input
   * @memberof SettingsCore
   */
  updateMiningWhitelist(input) {
    const output = form
      .resolveValue(input)
      .split(';')
      .filter(e => e !== '');
    console.log(output);
    this.props.updateSettings({
      ipMineWhitelist: output,
    });
  }

  /**
   * Updates the settings
   *
   * @memberof SettingsCore
   */
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

  // /**
  //  * Generates the number of ip witelist feilds there are
  //  *
  //  * @memberof SettingsCore
  //  */
  // ipWhiteListFeild=()=>{
  //   <TextField
  //               value={settings.verboseLevel}
  //               onChange={this.updateHandlers('verboseLevel')}
  //             />
  // }

  /**
   * Component's Renderable JSX
   *
   * @returns
   * @memberof SettingsCore
   */
  render() {
    const {
      coreConnected,
      handleSubmit,
      settings,
      pristine,
      submitting,
    } = this.props;

    if (!coreConnected && !settings.manualDaemon) {
      return (
        <WaitingMessage>
          {__('Connecting to Nexus Core')}
          ...
        </WaitingMessage>
      );
    }

    return (
      <>
        <form onSubmit={handleSubmit}>
          <SettingsField
            connectLabel
            label={__('Enable mining')}
            subLabel={__('Enable/Disable mining to the wallet.')}
          >
            <Switch
              checked={settings.enableMining}
              onChange={e => this.updateMining(e)}
            />
          </SettingsField>

          {settings.enableMining ? (
            <SettingsField
              connectLabel
              label={__('Mining IP Whitelist')}
              subLabel={__(
                'IPs allowed to mine to. Separate by <b>;</b>',
                undefined,
                {
                  b: txt => <b>{txt}</b>,
                }
              )}
            >
              <Field
                component={TextField.RF}
                onChange={e => this.updateMiningWhitelist(e)}
                name="ipMineWhitelist"
                size="12"
              />
            </SettingsField>
          ) : null}

          <SettingsField
            connectLabel
            label={__('Enable staking')}
            subLabel={__('Enable/Disable staking on the wallet.')}
          >
            <Switch
              checked={settings.enableStaking}
              onChange={e => this.updateStaking(e)}
            />
          </SettingsField>

          <SettingsField
            connectLabel
            label={__('Rescan wallet')}
            subLabel={__(
              'Used to correct transaction/balance issues, scans over every block in the database. Could take up to 10 minutes.'
            )}
          >
            <ReScanButton />
          </SettingsField>

          <SettingsField
            connectLabel
            label={__('Verbose level')}
            subLabel={__('Verbose level for logs.')}
          >
            <TextField
              type="number"
              value={settings.verboseLevel}
              min={0}
              max={5}
              onChange={this.updateHandlers('verboseLevel')}
              style={{ maxWidth: 50 }}
            />
          </SettingsField>

          <SettingsField
            connectLabel
            label={__('Avatar level')}
            subLabel={__('Avatar Level')}
          >
            <TextField
              type="number"
              value={settings.avatarLevel}
              min={0}
              max={5}
              onChange={this.updateHandlers('avatarLevel')}
              style={{ maxWidth: 50 }}
            />
          </SettingsField>

          <SettingsField
            connectLabel
            label={__('Manual Core mode')}
            subLabel={__(
              'Enable manual Core mode if you are running the Nexus Core manually outside of the wallet.'
            )}
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
              label={__('Username')}
              subLabel={__('Username configured for manual Core.')}
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
              label={__('Password')}
              subLabel={__('Password configured for manual Core.')}
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
              label={__('IP address')}
              subLabel={__('IP address configured for manual Core.')}
            >
              <Field component={TextField.RF} name="manualDaemonIP" size="12" />
            </SettingsField>

            <SettingsField
              indent={1}
              connectLabel
              label={__('Port')}
              subLabel={__('Port configured for manual Core.')}
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
              label={__('Data directory name')}
              subLabel={__('Data directory configured for manual Core.')}
            >
              <Field
                component={TextField.RF}
                name="manualDaemonDataDir"
                size={30}
              />
            </SettingsField>
          </div>

          {/*  REMOVING THIS FOR NOW TILL I CAN CONFIRM THE SECURITY AND FUNCTION
            <SettingsField
              indent={1}
              connectLabel
              label={'Move Data Dir'}
              subLabel={'Move the daemon data directory to a different folder'}
            >
              <div>
                <a>{'Current: ' + coreDataDir}</a>
                <Button onClick={this.moveDataDir}>
                  <Text id="Settings.MoveDataDirButton" />
                </Button>
              </div>
            </SettingsField>
            */}

          <div className="flex space-between" style={{ marginTop: '2em' }}>
            <Button onClick={this.restartCore}>{__('Restart Core')}</Button>

            {/* <Button
              type="submit"
              skin="primary"
              disabled={pristine || submitting}
            >
              {pristine ? (
                __('Settings saved')
              ) : submitting ? (
                <Text id="SavingSettings" />
              ) : (
                <Text id="SaveSettings" />
              )}
            </Button> */}
          </div>
        </form>
      </>
    );
  }
}
export default SettingsCore;
