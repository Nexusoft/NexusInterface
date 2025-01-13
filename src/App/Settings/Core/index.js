// External
import { useEffect, useId } from 'react';
import { useSelector } from 'react-redux';
import { useAtomValue } from 'jotai';
import styled from '@emotion/styled';

// Internal
import Form from 'components/Form';
import store from 'store';
import * as TYPE from 'consts/actionTypes';
import {
  switchSettingsTab,
  setCoreSettingsRestart,
  showNotification,
} from 'lib/ui';
import { confirm } from 'lib/dialog';
import { stopCore, startCore, restartCore } from 'lib/core';
import { refetchCoreInfo } from 'lib/coreInfo';
import { updateSettings, settingsAtom } from 'lib/settings';
import { formSubmit } from 'lib/form';
import Button from 'components/Button';
import Switch from 'components/Switch';

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
  'privateTestnet',
  'avatarMode',
  'coreDataDir',
  'allowAdvancedCoreOptions',
  'advancedCoreParams',
  'manualDaemonIP',
  'manualDaemonApiSSL',
  'manualDaemonApiPort',
  'manualDaemonApiPortSSL',
  'manualDaemonApiUser',
  'manualDaemonApiPassword',
  'embeddedCoreUseNonSSL',
  'embeddedCoreApiPort',
  'embeddedCoreApiPortSSL',
];

const getInitialValues = (() => {
  let lastOutput = null;
  let lastInput = null;

  return (settings) => {
    if (settings === lastInput) return lastOutput;

    let changed = false;
    const output = {};
    formKeys.forEach((key) => {
      if (!lastOutput || settings[key] !== lastOutput[key]) {
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
async function turnOffRemoteCore(restartForm) {
  const confirmed = await confirm({
    question: __('Exit remote Core mode?'),
    note: __('(This will restart your Core)'),
  });
  if (confirmed) {
    restartForm();
    store.dispatch({ type: TYPE.DISCONNECT_CORE });
    updateSettings('manualDaemon', false);
    await startCore();
    refetchCoreInfo();
  }
}

/**
 * Confirms turning on Remote Core
 */
async function turnOnRemoteCore(restartForm) {
  const confirmed = await confirm({
    question: __('Enter remote Core mode?'),
    note: __(
      '(Remote core will continue to run, but internal core will restart)'
    ),
  });
  if (confirmed) {
    restartForm();
    store.dispatch({ type: TYPE.DISCONNECT_CORE });
    updateSettings('manualDaemon', true);
    await stopCore();
    refetchCoreInfo();
  }
}

/**
 * Handles the logic when the switch is activated
 * @param {element} e Attached element
 */
function handleRestartSwitch(e) {
  setCoreSettingsRestart(!!e.target.checked);
}

export default function SettingsCore() {
  const switchId = useId();
  const settings = useAtomValue(settingsAtom);
  const { manualDaemon } = settings;
  const restartCoreOnSave = useSelector(
    (state) => state.ui.settings.restartCoreOnSave
  );

  useEffect(() => {
    switchSettingsTab('Core');
  }, []);

  return (
    <>
      <Form
        name="coreSettings"
        persistState
        initialValues={getInitialValues(settings)}
        keepDirtyOnReinitialize={false}
        onSubmit={formSubmit({
          submit: (updatedSettings) => {
            Object.keys(updatedSettings).forEach((key) => {
              const value = updatedSettings[key];
              if (value !== settings[key]) {
                updateSettings(key, value);
              }
            });
          },
          onSuccess: () => {
            showNotification(__('Core settings saved'), 'success');
            if (!manualDaemon && restartCoreOnSave) {
              showNotification(__('Restarting Core...'));
              restartCore();
            }
          },
          errorMessage: __('Error saving settings'),
        })}
        subscription={{ dirty: true }}
      >
        {({ dirty, form }) => (
          <div style={{ paddingBottom: dirty ? 55 : 0 }}>
            <CoreModes>
              <EmbeddedMode
                skin={manualDaemon ? 'default' : 'filled-primary'}
                active={!manualDaemon}
                onClick={
                  manualDaemon
                    ? () => turnOffRemoteCore(form.restart)
                    : undefined
                }
              >
                {__('Embedded Core')}
              </EmbeddedMode>
              <ManualMode
                skin={manualDaemon ? 'filled-primary' : 'default'}
                active={manualDaemon}
                onClick={
                  manualDaemon
                    ? undefined
                    : () => turnOnRemoteCore(form.restart)
                }
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

                  <Form.SubmitButton>{__('Save settings')}</Form.SubmitButton>
                </RestartContainer>
              </RestartPrompt>
            )}
          </div>
        )}
      </Form>
    </>
  );
}
