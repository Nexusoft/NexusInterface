import path from 'path';

import Form from 'components/Form';
import SettingsField from 'components/SettingsField';
import Button from 'components/Button';
import Switch from 'components/Switch';
import TextField from 'components/TextField';
import { useFieldValue } from 'lib/form';
import { updateSettings, settingAtoms } from 'lib/settings';
import { confirm, openErrorDialog } from 'lib/dialog';
import { restartCore, stopCore, startCore } from 'lib/core';
import { defaultConfig } from 'lib/coreConfig';
import { preRelease } from 'consts/misc';
import { rm as deleteDirectory } from 'fs/promises';
import { consts } from 'styles';
import store, { jotaiStore } from 'store';

__ = __context('Settings.Core');

const removeWhiteSpaces = (value) => (value || '').replace(' ', '');

export default function EmbeddedCoreSettings() {
  return (
    <>
      <BasicSettings />

      <SafeModeSetting />

      <SettingsField
        connectLabel
        label={__('Verbose level')}
        subLabel={__('Verbose level for logs.')}
        disabled={preRelease}
      >
        {preRelease ? (
          <TextField
            type="number"
            style={{ maxWidth: 50 }}
            value={3}
            disabled
          />
        ) : (
          <Form.TextField
            name="verboseLevel"
            type="number"
            min={0}
            max={5}
            style={{ maxWidth: 50 }}
          />
        )}
      </SettingsField>

      <SettingsField
        connectLabel
        label={__('Core Data Directory')}
        subLabel={__(
          'Where the blockchain data and your legacy wallet.dat are stored'
        )}
      >
        <Form.TextField name="coreDataDir" />
      </SettingsField>

      <TestnetSettings />

      <PortSettings />

      <SettingsField
        connectLabel
        label={__('Clear peer connections')}
        subLabel={__('Clear all stored peer connections and restart Nexus')}
      >
        <Button
          onClick={clearPeerConnections}
          style={{ height: consts.inputHeightEm + 'em' }}
        >
          {__('Clear')}
        </Button>
      </SettingsField>

      <AdvancedOptions />
    </>
  );
}

function BasicSettings() {
  const multiUser = useFieldValue('multiUser');
  const liteMode = useFieldValue('liteMode');
  const enableMining = useFieldValue('enableMining');

  return (
    <>
      <SettingsField
        connectLabel
        label={__('Lite mode')}
        subLabel={
          <div>
            <div>
              {__(
                'Nexus Core under lite mode runs lighter and synchronize much faster, but you will <b>NOT</b> be able to stake, mine, or switch the wallet to Legacy Mode.',
                null,
                { b: (text) => <strong>{text}</strong> }
              )}
            </div>
            {!!multiUser && (
              <div>{__('Disabled when Multi-user mode is on')}</div>
            )}
          </div>
        }
        disabled={multiUser}
      >
        {multiUser ? (
          <Switch readOnly value={false} />
        ) : (
          <Form.Switch name="liteMode" />
        )}
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
            onClick={resyncLiteMode}
            style={{ height: consts.inputHeightEm + 'em' }}
          >
            {__('Resynchronize')}
          </Button>
        </SettingsField>
      )}

      <SettingsField
        connectLabel
        label={__('Multi-user')}
        subLabel={
          <div>
            <div>
              {__(
                'Allow multiple logged in users at the same time. Mining and staking will be unavailable.'
              )}
            </div>
            {!!liteMode && <div>{__('Disabled when Lite mode is on')}</div>}
          </div>
        }
        disabled={liteMode}
      >
        {liteMode ? (
          <Switch readOnly value={false} />
        ) : (
          <Form.Switch name="multiUser" />
        )}
      </SettingsField>

      <SettingsField
        connectLabel
        label={__('Enable staking')}
        subLabel={
          <div>
            <div>{__('Enable/Disable staking on the wallet.')}</div>
            {!!(liteMode || multiUser) && (
              <div>
                {__('Disabled when either Lite mode or Multi-user mode is on')}
              </div>
            )}
          </div>
        }
        disabled={liteMode || multiUser}
      >
        {liteMode || multiUser ? (
          <Switch readOnly value={false} />
        ) : (
          <Form.Switch name="enableStaking" />
        )}
      </SettingsField>

      {/* <Field
          name="enableStaking"
          component={({ input: enableStaking }) =>
            !(liteMode || multiUser) &&
            !!enableStaking && (
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
        subLabel={
          <div>
            <div>{__('Enable/Disable mining to the wallet.')}</div>
            {!!(liteMode || multiUser) && (
              <div>
                {__('Disabled when either Lite mode or Multi-user mode is on')}
              </div>
            )}
          </div>
        }
        disabled={liteMode || multiUser}
      >
        {liteMode || multiUser ? (
          <Switch readOnly value={false} />
        ) : (
          <Form.Switch name="enableMining" />
        )}
      </SettingsField>

      {!(liteMode || multiUser) && !!enableMining && (
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
          <Form.TextField
            name="ipMineWhitelist"
            normalize={removeWhiteSpaces}
            size="12"
          />
        </SettingsField>
      )}
    </>
  );
}

function SafeModeSetting() {
  return (
    <SettingsField
      connectLabel
      label={__('Safe Mode')}
      subLabel={__(
        'Enables NextHash verification to protect against corruption, but adds computation time.'
      )}
    >
      <Form.Field name="safeMode" type="checkbox">
        {({ input }) => (
          <Switch
            {...input}
            onChange={async (e) => {
              const { checked } = e.target;
              if (!checked) {
                const confirmed = await confirm({
                  question:
                    __('Are you sure you want to disable Safe Mode') + '?',
                  note: 'In the unlikely event of hardware failure your sigchain could become inaccessible. Disabling safemode, while not having a recovery phrase, could result in loss of your coins. Proceed at your own risk.',
                });
                if (!confirmed) {
                  e.preventDefault();
                  return;
                }
              }
              input.onChange(checked);
            }}
          />
        )}
      </Form.Field>
    </SettingsField>
  );
}

function TestnetSettings() {
  const testnetIteration = useFieldValue('testnetIteration');

  return (
    <>
      <SettingsField
        connectLabel
        label={__('Testnet Iteration')}
        subLabel={__(
          'The iteration of Testnet to connect to. Leave it blank to connect to mainnet.'
        )}
        disabled={!!LOCK_TESTNET}
      >
        {LOCK_TESTNET ? (
          <TextField
            type="number"
            style={{ maxWidth: 50 }}
            value={LOCK_TESTNET}
            disabled
          />
        ) : (
          <Form.TextField
            name="testnetIteration"
            type="number"
            min={0}
            max={99999999}
            config={{
              parse: (value) => parseInt(value) || null,
              format: (value) => value || '',
            }}
            style={{ maxWidth: 50 }}
          />
        )}
      </SettingsField>

      {!!testnetIteration && testnetIteration !== '0' && (
        <SettingsField
          connectLabel
          indent={1}
          label={__('Private testnet')}
          subLabel={__('Private testnet runs locally on your machine')}
        >
          <Form.Switch name="privateTestnet" />
        </SettingsField>
      )}
    </>
  );
}

function PortSettings() {
  return (
    <>
      <SettingsField
        connectLabel
        label={__('API SSL Port')}
        subLabel={__('Nexus API server SSL Port')}
      >
        <Form.TextField
          name="embeddedCoreApiPortSSL"
          placeholder={defaultConfig.apiPortSSL}
          size="5"
        />
      </SettingsField>

      <SettingsField
        connectLabel
        label={__('Use non-SSL Ports')}
        subLabel={__(
          'Connect to Nexus Core using non-SSL Ports (less secured)'
        )}
      >
        <Form.Switch name="embeddedCoreUseNonSSL" />
      </SettingsField>

      <SettingsField
        connectLabel
        indent={1}
        label={__('API non-SSL Port')}
        subLabel={__('Nexus API server non-SSL Port')}
      >
        <Form.TextField
          name="embeddedCoreApiPort"
          placeholder={defaultConfig.apiPort}
          size="5"
        />
      </SettingsField>
    </>
  );
}

function AdvancedOptions() {
  const allowAdvancedCoreOptions = useFieldValue('allowAdvancedCoreOptions');

  return (
    <>
      <SettingsField
        connectLabel
        label={__('Advanced')}
        subLabel={__('Allow advanced core options')}
      >
        <Form.Switch name="allowAdvancedCoreOptions" />
      </SettingsField>

      {allowAdvancedCoreOptions && (
        <SettingsField
          connectLabel
          indent={1}
          label={__('Core Flags')}
          subLabel={__('Pass these flags to the core on start')}
        >
          <Form.TextField name="advancedCoreParams" />
        </SettingsField>
      )}
    </>
  );
}

/**
 *  Asks to reload TX History. Only for legacy mode.
 */
async function reloadTxHistory() {
  const confirmed = await confirm({
    question: __('Reload transaction history') + '?',
    note: 'Nexus Core will be restarted, after that, it will take a while for the transaction history to be reloaded',
  });
  if (confirmed) {
    updateSettings('walletClean', true);
    restartCore();
  }
}

/**
 *  Asks to clear Peer Connections. Only for legacy mode.
 */
async function clearPeerConnections() {
  const confirmed = await confirm({
    question: __('Clear peer connections') + '?',
    note: 'Nexus Core will be restarted. After that, all stored peer connections will be reset.',
  });
  if (confirmed) {
    updateSettings('clearPeers', true);
    restartCore();
  }
}

/**
 * Asks to resync when using Lite mode
 */
async function resyncLiteMode() {
  const confirmed = await confirm({
    question: __('Resync database') + '?',
    note: __(
      'Nexus Core will be restarted. Lite mode database will be deleted and resynchronized from the beginning.'
    ),
  });
  if (confirmed) {
    updateSettings('clearPeers', true);
    await stopCore();
    const coreDataDir = jotaiStore.get(settingAtoms.coreDataDir);
    const clientFolder = path.join(coreDataDir, 'client');
    try {
      await deleteDirectory(clientFolder, { recursive: true, force: true });
    } catch (err) {
      openErrorDialog({ message: err && err.message });
    }
    await startCore();
  }
}
