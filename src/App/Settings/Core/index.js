// External
import { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm, Field, Fields, formValueSelector } from 'redux-form';
// import cpy from 'cpy';
import path from 'path';
import styled from '@emotion/styled';

// Internal
import store from 'store';
import * as TYPE from 'consts/actionTypes';
import {
  switchSettingsTab,
  setCoreSettingsRestart,
  showNotification,
} from 'lib/ui';
import { confirm, openErrorDialog } from 'lib/dialog';
import { stopCore, startCore, restartCore } from 'lib/core';
import { refreshCoreInfo } from 'lib/coreInfo';
import { updateSettings } from 'lib/settings';
import { defaultConfig } from 'lib/coreConfig';
import SettingsField from 'components/SettingsField';
import Button from 'components/Button';
import TextField from 'components/TextField';
import Switch from 'components/Switch';
import { errorHandler } from 'utils/form';
import { legacyMode } from 'consts/misc';
import * as color from 'utils/color';
import deleteDirectory from 'utils/promisified/deleteDirectory';
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

const CoreModes = styled.div({
  display: 'flex',
  justifyContent: 'center',
  marginTop: 10,
  marginBottom: 20,
});

const EmbeddedMode = styled(Button)(
  {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    position: 'relative',
  },
  ({ active }) =>
    active && {
      zIndex: 1,
      cursor: 'default',
    }
);

const ManualMode = styled(Button)(
  {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    marginLeft: -1,
    position: 'relative',
  },
  ({ active }) =>
    active && {
      zIndex: 1,
      cursor: 'default',
    }
);

const removeWhiteSpaces = (value) => (value || '').replace(' ', '');

const formKeys = [
  'liteMode',
  'safeMode',
  'enableMining',
  'ipMineWhitelist',
  'enableStaking',
  'pooledStaking',
  'multiUser',
  'verboseLevel',
  'testnetIteration',
  'avatarMode',
  'coreDataDir',
  'manualDaemonIP',
  'manualDaemonSSL',
  'manualDaemonPort',
  'manualDaemonPortSSL',
  'manualDaemonUser',
  'manualDaemonPassword',
  'manualDaemonApiSSL',
  'manualDaemonApiPort',
  'manualDaemonApiPortSSL',
  'manualDaemonApiUser',
  'manualDaemonApiPassword',
  'embeddedCoreAllowNonSSL',
  'embeddedCoreUseNonSSL',
  'embeddedCoreApiPort',
  'embeddedCoreApiPortSSL',
  'embeddedCoreRpcPort',
  'embeddedCoreRpcPortSSL',
];
const getInitialValues = (() => {
  let lastOutput = null;
  let lastInput = null;

  return (settings) => {
    if (settings === lastInput) return lastOutput;

    let changed = false;
    const output = lastOutput || {};
    formKeys.forEach((key) => {
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

const mapStateToProps = (state) => {
  const {
    settings,
    ui: {
      settings: { restartCoreOnSave },
    },
    core: { systemInfo },
  } = state;
  const formTestnetIteration = formValueSelector('coreSettings')(
    state,
    'testnetIteration'
  );
  const settingTestnetIteration = settings.testnetIteration;
  return {
    showTestnetOff:
      (formTestnetIteration && formTestnetIteration != 0) ||
      (settingTestnetIteration && settingTestnetIteration != 0),
    coreConnected: isCoreConnected(state),
    liteMode: !!systemInfo?.clientmode,
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
      manualDaemonIP,
      manualDaemonPort,
      manualDaemonUser,
      manualDaemonPassword,
      manualDaemonApiPort,
      manualDaemonApiUser,
      manualDaemonApiPassword,
    },
    props
  ) => {
    const errors = {};
    if (!verboseLevel && verboseLevel !== 0) {
      errors.verboseLevel = __('Verbose level is required');
    }

    if (props.manualDaemon) {
      if (!manualDaemonIP) {
        errors.manualDaemonIP = __('Remote Core IP is required');
      }
      if (!manualDaemonPort) {
        errors.manualDaemonPort = __('RPC port is required');
      }
      if (!manualDaemonUser) {
        errors.manualDaemonUser = __('RPC username is required');
      }
      if (!manualDaemonPassword) {
        errors.manualDaemonPassword = __('RPC password is required');
      }
      if (!legacyMode) {
        if (!manualDaemonApiPort) {
          errors.manualDaemonApiPort = __('API port is required');
        }
        if (!manualDaemonApiUser) {
          errors.manualDaemonApiUser = __('API username is required');
        }
        if (!manualDaemonApiPassword) {
          errors.manualDaemonApiPassword = __('API password is required');
        }
      }
    }
    return errors;
  },
  onSubmit: async (values) => {
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

  handleRestartSwitch = (e) => {
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
   * Confirms Switch to Remote Core
   *
   * @memberof SettingsCore
   */
  confirmSwitchManualDaemon = async () => {
    const { manualDaemon } = this.props;

    if (manualDaemon) {
      const confirmed = await confirm({
        question: __('Exit remote Core mode?'),
        note: __('(This will restart your Core)'),
      });
      if (confirmed) {
        store.dispatch({ type: TYPE.DISCONNECT_CORE });
        updateSettings({ manualDaemon: false });
        await startCore();
        refreshCoreInfo();
      }
    } else {
      const confirmed = await confirm({
        question: __('Enter remote Core mode?'),
        note: __('(This will restart your Core)'),
      });
      if (confirmed) {
        store.dispatch({ type: TYPE.DISCONNECT_CORE });
        updateSettings({ manualDaemon: true });
        await stopCore();
        refreshCoreInfo();
      }
    }
  };

  disableSafeMode = async (e) => {
    if (e.target.defaultValue === 'true') {
      e.preventDefault();
      const confirmed = await confirm({
        question: __('Are you sure you want to disable Safe Mode') + '?',
        note: 'In the unlikely event of hardware failure, your sigchain may become inaccessible.',
      });
      if (confirmed) {
        this.props.change('safeMode', false);
      }
    }
  };

  reloadTxHistory = async () => {
    const confirmed = await confirm({
      question: __('Reload transaction history') + '?',
      note: 'Nexus Core will be restarted, after that, it will take a while for the transaction history to be reloaded',
    });
    if (confirmed) {
      updateSettings({ walletClean: true });
      restartCore();
    }
  };

  clearPeerConnections = async () => {
    const confirmed = await confirm({
      question: __('Clear peer connections') + '?',
      note: 'Nexus Core will be restarted. After that, all stored peer connections will be reset.',
    });
    if (confirmed) {
      updateSettings({ clearPeers: true });
      restartCore();
    }
  };

  resyncLiteMode = async () => {
    const confirmed = await confirm({
      question: __('Resync database') + '?',
      note: __(
        'Nexus Core will be restarted. Lite mode database will be deleted and resynchronized from the beginning.'
      ),
    });
    if (confirmed) {
      updateSettings({ clearPeers: true });
      await stopCore();
      const {
        settings: { coreDataDir },
      } = store.getState();
      const clientFolder = path.join(coreDataDir, 'client');
      try {
        await deleteDirectory(clientFolder);
      } catch (err) {
        openErrorDialog({ message: err && err.message });
      }
      await startCore();
    }
  };

  turnOffTestNet = (e) => {
    this.props.change('testnetIteration', null);
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
      liteMode,
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
          <CoreModes>
            <EmbeddedMode
              skin={manualDaemon ? 'default' : 'filled-primary'}
              active={!manualDaemon}
              onClick={
                manualDaemon ? this.confirmSwitchManualDaemon : undefined
              }
            >
              {__('Embedded Core')}
            </EmbeddedMode>
            <ManualMode
              skin={manualDaemon ? 'filled-primary' : 'default'}
              active={manualDaemon}
              onClick={
                manualDaemon ? undefined : this.confirmSwitchManualDaemon
              }
            >
              {__('Remote Core')}
            </ManualMode>
          </CoreModes>

          {!manualDaemon && (
            <>
              <Field
                name="multiUser"
                component={({ input: multiUser }) => (
                  <SettingsField
                    connectLabel
                    label={__('Lite mode')}
                    subLabel={__(
                      'Nexus Core under lite mode runs lighter and synchronize much faster, but you will <b>NOT</b> be able to stake, mine, or switch the wallet to Legacy Mode.',
                      null,
                      { b: (text) => <strong>{text}</strong> }
                    )}
                    disabled={multiUser.value}
                  >
                    {multiUser.value ? (
                      <Switch readOnly value={false} />
                    ) : (
                      <Field name="liteMode" component={Switch.RF} />
                    )}
                  </SettingsField>
                )}
              />

              <Field
                name="liteMode"
                component={({ input: liteMode }) => (
                  <SettingsField
                    connectLabel
                    label={__('Multi-user')}
                    subLabel={__(
                      'Allow multiple logged in users at the same time. Mining and staking will be unavailable.'
                    )}
                    disabled={liteMode.value}
                  >
                    {liteMode.value ? (
                      <Switch readOnly value={false} />
                    ) : (
                      <Field name="multiUser" component={Switch.RF} />
                    )}
                  </SettingsField>
                )}
              />

              <Fields
                names={['liteMode', 'multiUser']}
                component={({
                  liteMode: { input: liteMode },
                  multiUser: { input: multiUser },
                }) => (
                  <>
                    <SettingsField
                      connectLabel
                      label={__('Enable staking')}
                      subLabel={__('Enable/Disable staking on the wallet.')}
                      disabled={liteMode.value || multiUser.value}
                    >
                      {liteMode.value || multiUser.value ? (
                        <Switch readOnly value={false} />
                      ) : (
                        <Field name="enableStaking" component={Switch.RF} />
                      )}
                    </SettingsField>

                    {/* <Field
                      name="enableStaking"
                      component={({ input: enableStaking }) =>
                        !(liteMode.value || multiUser.value) &&
                        !!enableStaking.value && (
                          <SettingsField
                            connectLabel
                            indent={1}
                            label={__('Pooled staking')}
                            subLabel={__(
                              'Pooled staking is a decentralized and trust-less mechanism allowing you to use the balances of others to increase your chances of finding a stake block. All participants receive their staking rewards and build trust, regardless of which user mines the block. A small portion of each reward is paid to the block finder by all pool participants.'
                            )}
                          >
                            <Field name="pooledStaking" component={Switch.RF} />
                          </SettingsField>
                        )
                      }
                    /> */}

                    <SettingsField
                      connectLabel
                      label={__('Enable mining')}
                      subLabel={__('Enable/Disable mining to the wallet.')}
                      disabled={liteMode.value || multiUser.value}
                    >
                      {liteMode.value || multiUser.value ? (
                        <Switch readOnly value={false} />
                      ) : (
                        <Field name="enableMining" component={Switch.RF} />
                      )}
                    </SettingsField>

                    <Field
                      name="enableMining"
                      component={({ input: enableMining }) =>
                        !(liteMode.value || multiUser.value) &&
                        !!enableMining.value && (
                          <SettingsField
                            connectLabel
                            indent={1}
                            label={__('Mining IP Whitelist')}
                            subLabel={__(
                              'IP/Ports allowed to mine to. Separate by <b>;</b> . Wildcards supported only in IP',
                              undefined,
                              {
                                b: (txt) => <b>{txt}</b>,
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
                  </>
                )}
              />

              <SettingsField
                connectLabel
                label={__('Safe Mode')}
                subLabel={__(
                  'Enables NextHash verification to protect against corruption, but adds computation time.'
                )}
              >
                <Field
                  name="safeMode"
                  component={Switch.RF}
                  onChange={this.disableSafeMode}
                />
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
                  min={0}
                  max={99999999}
                  style={{ maxWidth: 50 }}
                />
              </SettingsField>

              <SettingsField
                connectLabel
                label={__('API SSL Port')}
                subLabel={__('Nexus API server SSL Port')}
              >
                <Field
                  component={TextField.RF}
                  name="embeddedCoreApiPortSSL"
                  placeholder={defaultConfig.apiPortSSL}
                  size="5"
                />
              </SettingsField>

              <SettingsField
                connectLabel
                label={__('RPC SSL Port')}
                subLabel={__('Nexus RPC server SSL Port')}
              >
                <Field
                  component={TextField.RF}
                  name="embeddedCoreRpcPortSSL"
                  placeholder={defaultConfig.portSSL}
                  size="5"
                />
              </SettingsField>

              <SettingsField
                connectLabel
                label={__('Allow Non-SSL Ports')}
                subLabel={__(
                  'Allows Non-SSL plaintext communication to the core'
                )}
              >
                <Field name="embeddedCoreAllowNonSSL" component={Switch.RF} />
              </SettingsField>

              <Field
                name="embeddedCoreAllowNonSSL"
                component={({ input: embeddedCoreAllowNonSSL }) =>
                  embeddedCoreAllowNonSSL.value && (
                    <>
                      <SettingsField
                        connectLabel
                        indent={1}
                        label={__('Use non-SSL Ports')}
                        subLabel={__(
                          'Connect to Nexus Core using non-SSL Ports'
                        )}
                      >
                        <Field
                          name="embeddedCoreUseNonSSL"
                          component={Switch.RF}
                        />
                      </SettingsField>

                      <SettingsField
                        connectLabel
                        indent={1}
                        label={__('API non-SSL Port')}
                        subLabel={__('Nexus API server non-SSL Port')}
                      >
                        <Field
                          component={TextField.RF}
                          name="embeddedCoreApiPort"
                          placeholder={defaultConfig.apiPort}
                          size="5"
                        />
                      </SettingsField>

                      <SettingsField
                        connectLabel
                        indent={1}
                        label={__('RPC non-SSL Port')}
                        subLabel={__('Nexus RPC server non-SSL Port')}
                      >
                        <Field
                          component={TextField.RF}
                          name="embeddedCoreRpcPort"
                          placeholder={defaultConfig.port}
                          size="5"
                        />
                      </SettingsField>
                    </>
                  )
                }
              />

              {legacyMode && (
                <>
                  <SettingsField
                    connectLabel
                    label={__('Avatar Mode')}
                    subLabel={__(
                      'Disabling Avatar will make the core use a separate change key'
                    )}
                  >
                    <Field name="avatarMode" component={Switch.RF} />
                  </SettingsField>

                  <SettingsField
                    connectLabel
                    label={__('Rescan wallet')}
                    subLabel={__(
                      'Used to correct transaction/balance issues, scans over every block in the database. Could take up to 10 minutes.'
                    )}
                  >
                    <ReScanButton disabled={!coreConnected} />
                  </SettingsField>

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
                </>
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

              {liteMode && (
                <SettingsField
                  connectLabel
                  label={__('Resync database')}
                  subLabel={__(
                    'Delete lite mode database and resynchronize from the beginning'
                  )}
                >
                  <Button
                    onClick={this.resyncLiteMode}
                    style={{ height: consts.inputHeightEm + 'em' }}
                  >
                    {__('Resynchronize')}
                  </Button>
                </SettingsField>
              )}
            </>
          )}

          {!!manualDaemon && (
            <>
              <SettingsField
                indent={1}
                connectLabel
                label={__('IP address')}
                subLabel={__('Remote Core IP address')}
              >
                <Field
                  component={TextField.RF}
                  name="manualDaemonIP"
                  size="12"
                />
              </SettingsField>

              {!legacyMode && (
                <>
                  <SettingsField
                    indent={1}
                    connectLabel
                    label={__('API SSL')}
                    subLabel={__('Use SSL for API calls')}
                  >
                    <Field component={Switch.RF} name="manualDaemonApiSSL" />
                  </SettingsField>

                  <SettingsField
                    indent={1}
                    connectLabel
                    label={__('API non-SSL Port')}
                    subLabel={__('Nexus API server non-SSL Port')}
                  >
                    <Field
                      component={TextField.RF}
                      name="manualDaemonApiPort"
                      size="5"
                    />
                  </SettingsField>

                  <SettingsField
                    indent={1}
                    connectLabel
                    label={__('API SSL Port')}
                    subLabel={__('Nexus API server SSL Port')}
                  >
                    <Field
                      component={TextField.RF}
                      name="manualDaemonApiPortSSL"
                      size="5"
                    />
                  </SettingsField>

                  <SettingsField
                    indent={1}
                    connectLabel
                    label={__('API Username')}
                    subLabel={__('Nexus API server Username')}
                  >
                    <Field
                      component={TextField.RF}
                      name="manualDaemonApiUser"
                      size="12"
                    />
                  </SettingsField>

                  <SettingsField
                    indent={1}
                    connectLabel
                    label={__('API Password')}
                    subLabel={__('Nexus API server Password')}
                  >
                    <Field
                      component={TextField.RF}
                      name="manualDaemonApiPassword"
                      size="12"
                    />
                  </SettingsField>
                </>
              )}

              <SettingsField
                indent={1}
                connectLabel
                label={__('RPC SSL')}
                subLabel={__('Use SSL for RPC calls')}
              >
                <Field component={Switch.RF} name="manualDaemonSSL" />
              </SettingsField>

              <SettingsField
                indent={1}
                connectLabel
                label={__('RPC non-SSL Port')}
                subLabel={__('Nexus RPC server non-SSL Port')}
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
                label={__('RPC SSL Port')}
                subLabel={__('Nexus RPC server SSL Port')}
              >
                <Field
                  component={TextField.RF}
                  name="manualDaemonPortSSL"
                  size="5"
                />
              </SettingsField>

              <SettingsField
                indent={1}
                connectLabel
                label={__('RPC Username')}
                subLabel={__('Nexus RPC server Username')}
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
                label={__('RPC Password')}
                subLabel={__('Nexus RPC server Password')}
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
                label={__('Log out on close')}
                subLabel={__('Log out of all users before closing the wallet')}
              >
                <Field component={Switch.RF} name="manualDaemonLogOutOnClose" />
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
