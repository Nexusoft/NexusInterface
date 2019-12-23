// External
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm, Field, formValueSelector } from 'redux-form';
// import cpy from 'cpy';
import styled from '@emotion/styled';

// Internal
import { switchSettingsTab, setCoreSettingsRestart } from 'lib/ui';
import { stopCore, startCore, restartCore } from 'lib/core';
import { showNotification, openConfirmDialog } from 'lib/ui';
import { updateSettings } from 'lib/settings';
import SettingsField from 'components/SettingsField';
import Button from 'components/Button';
import TextField from 'components/TextField';
import Switch from 'components/Switch';
import { errorHandler } from 'utils/form';
import { legacyMode } from 'consts/misc';
import * as color from 'utils/color';
import confirm from 'utils/promisified/confirm';
import { newUID } from 'utils/misc';
import { consts } from 'styles';
import { isCoreConnected } from 'selectors';

import ReScanButton from './RescanButton.js';

__ = __context('Settings.Core');

const RestartPrompt = styled.div(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  background: color.darken(theme.background, 0.3),
  borderTop: `1px solid ${theme.mixer(0.5)}`,
  paddingTop: 10,
  marginRight: 6,
  zIndex: 1,
}));

const RestartContainer = styled.div({
  maxWidth: 750,
  margin: '0 auto',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

const removeWhiteSpaces = value => (value || '').replace(' ', '');

const formKeys = [
  'enableMining',
  'ipMineWhitelist',
  'enableStaking',
  'verboseLevel',
  'testnetIteration',
  'avatarMode',
  'coreDataDir',
  legacyMode ? 'manualDaemonIP' : 'manualDaemonApiIP',
  legacyMode ? 'manualDaemonPort' : 'manualDaemonApiPort',
  'manualDaemonUser',
  'manualDaemonPassword',
  'manualDaemonApiUser',
  'manualDaemonApiPassword',
  'manualDaemonDataDir',
];
const getInitialValues = (() => {
  let lastOutput = null;
  let lastInput = null;

  return settings => {
    if (settings === lastInput) return lastOutput;

    let changed = false;
    const output = lastOutput || {};
    formKeys.forEach(key => {
      if (settings[key] !== output[key]) {
        changed = true;
      }
      output[key] = settings[key];
    });

    lastInput = settings;
    if (changed) {
      return (lastOutput = output);
    } else {
      return lastOutput;
    }
  };
})();

const mapStateToProps = state => {
  const {
    settings,
    ui: {
      settings: { restartCoreOnSave },
    },
  } = state;
  const formTestnetIteration = formValueSelector('coreSettings')(
    state,
    'testnetIteration'
  );
  const settingTestnetIteration = settings.testnetIteration;
  return {
    showTestnetOff: formTestnetIteration || settingTestnetIteration,
    coreConnected: isCoreConnected(state),
    manualDaemon: settings.manualDaemon,
    initialValues: getInitialValues(settings),
    restartCoreOnSave,
  };
};

/**
 * Core Settings page that is inside Settings
 *
 * @class SettingsCore
 * @extends {Component}
 */
@connect(mapStateToProps)
@reduxForm({
  form: 'coreSettings',
  destroyOnUnmount: false,
  enableReinitialize: true,
  validate: (
    {
      verboseLevel,
      manualDaemonUser,
      manualDaemonPassword,
      manualDaemonIP,
      manualDaemonPort,
      manualDaemonApiIP,
      manualDaemonApiPort,
      manualDaemonDataDir,
    },
    props
  ) => {
    const errors = {};
    if (!verboseLevel && verboseLevel !== 0) {
      errors.verboseLevel = __('Verbose level is required');
    }

    if (props.manualDaemon) {
      if (!manualDaemonUser) {
        errors.manualDaemonUser = __('Manual Core username is required');
      }
      if (!manualDaemonPassword) {
        errors.manualDaemonPassword = __('Manual Core password is required');
      }
      if (legacyMode) {
        if (!manualDaemonIP) {
          errors.manualDaemonIP = __('Manual Core IP is required');
        }
        if (!manualDaemonPort) {
          errors.manualDaemonPort = __('Manual Core port is required');
        }
      } else {
        if (!manualDaemonApiIP) {
          errors.manualDaemonApiIP = __('Manual Core IP is required');
        }
        if (!manualDaemonApiPort) {
          errors.manualDaemonApiPort = __('Manual Core port is required');
        }
      }
      if (!manualDaemonDataDir) {
        errors.manualDaemonDataDir = __('Data directory is required');
      }
    }
    return errors;
  },
  onSubmit: async values => {
    return updateSettings(values);
  },
  onSubmitSuccess: (result, dispatch, props) => {
    showNotification(__('Core settings saved'), 'success');
    if (!props.manualDaemon && props.restartCoreOnSave) {
      showNotification(__('Restarting Core...'));
      restartCore();
    }
  },
  onSubmitFail: errorHandler('Error saving settings'),
})
class SettingsCore extends Component {
  switchId = newUID();

  handleRestartSwitch = e => {
    setCoreSettingsRestart(!!e.target.checked);
  };

  /**
   *Creates an instance of SettingsCore.
   * @param {*} props
   * @memberof SettingsCore
   */
  constructor(props) {
    super(props);
    switchSettingsTab('Core');
  }

  /**
   * Confirms Switch to Manual Core
   *
   * @memberof SettingsCore
   */
  confirmSwitchManualDaemon = () => {
    const { manualDaemon } = this.props;

    if (manualDaemon) {
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

  reloadTxHistory = async () => {
    const confirmed = await confirm({
      question: __('Reload transaction history') + '?',
      note:
        'Nexus Core will be restarted, after that, it will take a while for the transaction history to be reloaded',
    });
    if (confirmed) {
      updateSettings({ walletClean: true });
      restartCore();
    }
  };

  clearPeerConnections = async () => {
    const confirmed = await confirm({
      question: __('Clear peer connections') + '?',
      note:
        'Nexus Core will be restarted. After that, all stored peer connections will be reset.',
    });
    if (confirmed) {
      updateSettings({ clearPeers: true });
      this.props.restartCore();
    }
  };

  turnOffTestNet = e => {
    this.props.change('testnetIteration', null);
    updateSettings({ testnetIteration: null });
  };

  /**
   * Component's Renderable JSX
   *
   * @returns
   * @memberof SettingsCore
   */
  render() {
    const {
      coreConnected,
      manualDaemon,
      handleSubmit,
      dirty,
      submitting,
      restartCoreOnSave,
      showTestnetOff,
    } = this.props;

    return (
      <>
        <form onSubmit={handleSubmit} style={{ paddingBottom: dirty ? 55 : 0 }}>
          {!manualDaemon && (
            <>
              <SettingsField
                connectLabel
                label={__('Enable mining')}
                subLabel={__('Enable/Disable mining to the wallet.')}
              >
                <Field name="enableMining" component={Switch.RF} />
              </SettingsField>

              <Field
                name="enableMining"
                component={({ input }) =>
                  !!input.value && (
                    <SettingsField
                      connectLabel
                      indent={1}
                      label={__('Mining IP Whitelist')}
                      subLabel={__(
                        'IP/Ports allowed to mine to. Separate by <b>;</b> . Wildcards supported only in IP',
                        undefined,
                        {
                          b: txt => <b>{txt}</b>,
                        }
                      )}
                    >
                      <Field
                        name="ipMineWhitelist"
                        component={TextField.RF}
                        normalize={removeWhiteSpaces}
                        size="12"
                      />
                    </SettingsField>
                  )
                }
              />

              <SettingsField
                connectLabel
                label={__('Enable staking')}
                subLabel={__('Enable/Disable staking on the wallet.')}
              >
                <Field name="enableStaking" component={Switch.RF} />
              </SettingsField>

              {legacyMode && (
                <SettingsField
                  connectLabel
                  label={__('Rescan wallet')}
                  subLabel={__(
                    'Used to correct transaction/balance issues, scans over every block in the database. Could take up to 10 minutes.'
                  )}
                >
                  <ReScanButton disabled={!coreConnected} />
                </SettingsField>
              )}

              {legacyMode && (
                <SettingsField
                  connectLabel
                  label={__('Reload transaction history')}
                  subLabel={__(
                    'Restart Nexus core with -walletclean parameter to clean out and reload all transaction history'
                  )}
                >
                  <Button
                    onClick={this.reloadTxHistory}
                    style={{ height: consts.inputHeightEm + 'em' }}
                  >
                    {__('Reload')}
                  </Button>
                </SettingsField>
              )}

              <SettingsField
                connectLabel
                label={__('Clear peer connections')}
                subLabel={__(
                  'Clear all stored peer connections and restart Nexus'
                )}
              >
                <Button
                  onClick={this.clearPeerConnections}
                  style={{ height: consts.inputHeightEm + 'em' }}
                >
                  {__('Clear')}
                </Button>
              </SettingsField>

              <SettingsField
                connectLabel
                label={__('Verbose level')}
                subLabel={__('Verbose level for logs.')}
              >
                <Field
                  name="verboseLevel"
                  component={TextField.RF}
                  type="number"
                  min={0}
                  max={5}
                  style={{ maxWidth: 50 }}
                />
              </SettingsField>

              <SettingsField
                connectLabel
                label={__('Core Data Directory')}
                subLabel={__(
                  'Where the blockchain data and your legacy wallet.dat are stored'
                )}
              >
                <Field name="coreDataDir" component={TextField.RF} />
              </SettingsField>

              <SettingsField
                connectLabel
                label={__('Testnet Iteration')}
                subLabel={
                  <>
                    {__('The iteration of Testnet to connect to.')}{' '}
                    {showTestnetOff && (
                      <Button
                        style={{ height: '25%', width: '25%' }}
                        onClick={this.turnOffTestNet}
                      >
                        {__('Turn Off')}
                      </Button>
                    )}
                  </>
                }
              >
                <Field
                  name="testnetIteration"
                  component={TextField.RF}
                  type="number"
                  min={1}
                  max={99999999}
                  style={{ maxWidth: 50 }}
                />
              </SettingsField>

              {legacyMode && (
                <SettingsField
                  connectLabel
                  label={__('Avatar Mode')}
                  subLabel={__(
                    'Disabling Avatar will make the core use a separate change key'
                  )}
                >
                  <Field name="avatarMode" component={Switch.RF} />
                </SettingsField>
              )}
            </>
          )}

          <SettingsField
            connectLabel
            label={__('Manual Core mode')}
            subLabel={__(
              'Enable manual Core mode if you are running the Nexus Core manually outside of the wallet.'
            )}
          >
            <Switch
              checked={manualDaemon}
              onChange={this.confirmSwitchManualDaemon}
            />
          </SettingsField>

          {!!manualDaemon && (
            <>
              <SettingsField
                indent={1}
                connectLabel
                label={__('Username')}
                subLabel={__('Username configured for manual Core.')}
              >
                <Field
                  component={TextField.RF}
                  name={legacyMode ? 'manualDaemonUser' : 'manualDaemonApiUser'}
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
                  name={
                    legacyMode
                      ? 'manualDaemonPassword'
                      : 'manualDaemonApiPassword'
                  }
                  size="12"
                />
              </SettingsField>

              <SettingsField
                indent={1}
                connectLabel
                label={__('IP address')}
                subLabel={__('IP address configured for manual Core.')}
              >
                <Field
                  component={TextField.RF}
                  name={legacyMode ? 'manualDaemonIP' : 'manualDaemonApiIP'}
                  size="12"
                />
              </SettingsField>

              <SettingsField
                indent={1}
                connectLabel
                label={__('Port')}
                subLabel={__('Port configured for manual Core.')}
              >
                <Field
                  component={TextField.RF}
                  name={legacyMode ? 'manualDaemonPort' : 'manualDaemonApiPort'}
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
            </>
          )}
          {!!dirty && (
            <RestartPrompt>
              <RestartContainer>
                <div className="flex center">
                  {!manualDaemon && (
                    <>
                      <Switch
                        id={this.switchId}
                        checked={restartCoreOnSave}
                        onChange={this.handleRestartSwitch}
                        style={{ fontSize: '0.7em' }}
                      />
                      &nbsp;
                      <label
                        htmlFor={this.switchId}
                        style={{
                          cursor: 'pointer',
                          opacity: restartCoreOnSave ? 1 : 0.7,
                        }}
                      >
                        {__('Restart Core for these changes to take effect')}
                      </label>
                    </>
                  )}
                </div>

                <Button type="submit" disabled={submitting}>
                  {__('Save settings')}
                </Button>
              </RestartContainer>
            </RestartPrompt>
          )}
        </form>
      </>
    );
  }
}
export default SettingsCore;
