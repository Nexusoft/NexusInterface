// External
import { useEffect } from 'react';
import { connect } from 'react-redux';
import { reduxForm, formValueSelector } from 'redux-form';
import styled from '@emotion/styled';

// Internal
import store from 'store';
import * as TYPE from 'consts/actionTypes';
import {
  switchSettingsTab,
  setCoreSettingsRestart,
  showNotification,
} from 'lib/ui';
import { confirm } from 'lib/dialog';
import { stopCore, startCore, restartCore } from 'lib/core';
import { refreshCoreInfo } from 'lib/coreInfo';
import { updateSettings } from 'lib/settings';

import Button from 'components/Button';
import Switch from 'components/Switch';
import { errorHandler } from 'utils/form';
import { legacyMode } from 'consts/misc';
import useUID from 'utils/useUID.js';
import { isCoreConnected } from 'selectors';

import EmbeddedCoreSettings from './EmbeddedCoreSettings';
import RemoteCoreSettings from './RemoteCoreSettings';

__ = __context('Settings.Core');

const RestartPrompt = styled.div(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  background: theme.lower(theme.background, 0.3),
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

/**
 *  Keys to change in the settings. Have a key here and set the name field to the same key to connect it.
 */
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
  'allowAdvancedCoreOptions',
  'advancedCoreParams',
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

/**
 * Confirms turning off Remote Core
 */
async function turnOffRemoteCore() {
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
}

/**
 * Confirms turning on Remote Core
 */
async function turnOnRemoteCore() {
  const confirmed = await confirm({
    question: __('Enter remote Core mode?'),
    note: __(
      '(Remote core will continue to run, but internal core will restart)'
    ),
  });
  if (confirmed) {
    store.dispatch({ type: TYPE.DISCONNECT_CORE });
    updateSettings({ manualDaemon: true });
    await stopCore();
    refreshCoreInfo();
  }
}

/**
 * Handles the logic when the switch is activated
 * @param {element} e Attached element
 */
function handleRestartSwitch(e) {
  setCoreSettingsRestart(!!e.target.checked);
}

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
    liteMode: !!systemInfo?.litemode,
    manualDaemon: settings.manualDaemon,
    initialValues: getInitialValues(settings),
    restartCoreOnSave,
  };
};

const formOptions = {
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
};

function SettingsCore({
  coreConnected,
  liteMode,
  manualDaemon,
  handleSubmit,
  dirty,
  submitting,
  restartCoreOnSave,
  showTestnetOff,
  change,
}) {
  const switchId = useUID();

  useEffect(() => {
    switchSettingsTab('Core');
  }, []);

  return (
    <>
      <form onSubmit={handleSubmit} style={{ paddingBottom: dirty ? 55 : 0 }}>
        <CoreModes>
          <EmbeddedMode
            skin={manualDaemon ? 'default' : 'filled-primary'}
            active={!manualDaemon}
            onClick={manualDaemon ? turnOffRemoteCore : undefined}
          >
            {__('Embedded Core')}
          </EmbeddedMode>
          <ManualMode
            skin={manualDaemon ? 'filled-primary' : 'default'}
            active={manualDaemon}
            onClick={manualDaemon ? undefined : turnOnRemoteCore}
          >
            {__('Remote Core')}
          </ManualMode>
        </CoreModes>

        {!manualDaemon && <EmbeddedCoreSettings />}

        {!!manualDaemon && <RemoteCoreSettings />}
        {!!dirty && (
          <RestartPrompt>
            <RestartContainer>
              <div className="flex center">
                {!manualDaemon && (
                  <>
                    <Switch
                      id={switchId}
                      checked={restartCoreOnSave}
                      onChange={handleRestartSwitch}
                      style={{ fontSize: '0.7em' }}
                    />
                    &nbsp;
                    <label
                      htmlFor={switchId}
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

export default connect(mapStateToProps)(reduxForm(formOptions)(SettingsCore));
