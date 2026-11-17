// External
import { useAtomValue } from 'jotai';
import styled from '@emotion/styled';
import UT from 'lib/usageTracking';

// Internal Global
import { updateSettings, settingsAtom } from 'lib/settings';
import SettingsField from 'components/SettingsField';
import Button from 'components/Button';
import Switch from 'components/Switch';
import Icon from 'components/Icon';
import { confirm } from 'lib/dialog';
import * as form from 'lib/form';
import warningIcon from 'icons/warning.svg';
import {
  checkForUpdates,
  stopAutoUpdate,
  setAllowPrerelease,
  migrateToMainnet,
} from 'lib/updater';

// Internal Local
import { useSettingsTab } from '../atoms';
import LanguageSetting from './LanguageSetting';

__ = __context('Settings.Application');

const WarningIcon = styled(Icon)(({ theme }) => ({
  color: theme.raise(theme.danger, 0.3),
  fontSize: '1.1em',
}));

/**
 * Handles setting the auto launch function.
 * @param {element} e Attached element
 */
async function toggleOpenOnStart(checked: boolean) {
  try {
    await window.nexusElectron.app.setOpenOnStart(checked);
    updateSettings({ openOnStart: checked });
  } catch (error) {
    console.error(error);
  }
}

/**
 * Toggles if modules should be verified or not.
 */
async function toggleVerifyModuleSource(checked: boolean) {
  if (checked) {
    const confirmed = await confirm({
      question: __('Turn module open source policy on?'),
      note: __(
        'All modules without open source verifications, possibly including your own under-development modules, will become invalid. Wallet must be refreshed for the change to take effect.'
      ),
    });
    if (confirmed) {
      updateSettings({ verifyModuleSource: true });
      location.reload();
    }
  } else {
    const confirmed = await confirm({
      question: __('Turn module open source policy off?'),
      note: (
        <div>
          <p>
            {__(`This is only for module developers and can be dangerous for
            regular users. Please make sure you know what you are doing!`)}
          </p>
          <p>
            {__(`It would be much easier for a closed source module to hide
            malicious code than for an open source one. Therefore, in case you
            still want to disable this setting, it is highly recommended that
            you only install and run closed source modules that you are
            developing yourself.`)}
          </p>
        </div>
      ),
      labelYes: __('Turn policy off'),
      skinYes: 'danger',
      labelNo: __('Keep policy on'),
      skinNo: 'primary',
      style: { width: 600 },
    });
    if (confirmed) {
      updateSettings({ verifyModuleSource: false });
      location.reload();
    }
  }
}

/**
 * Handles update Change
 */
async function handleAutoUpdateChange(checked: boolean) {
  if (!checked) {
    const confirmed = await confirm({
      question: __('Are you sure you want to disable auto update?'),
      note: __(
        'Keeping your wallet up-to-date is important for your security and will ensure that you get the best possible user experience.'
      ),
      labelYes: __('Keep auto update On'),
      labelNo: __('Turn auto update Off'),
      skinNo: 'danger',
      style: { width: 580 },
    });
    if (!confirmed) {
      updateSettings({ autoUpdate: false });
      stopAutoUpdate();
    }
  } else {
    updateSettings({ autoUpdate: true });
    checkForUpdates();
  }
}

export default function SettingsApp() {
  useSettingsTab('App');
  const settings = useAtomValue(settingsAtom);

  const updateHandlers = (settingName: string) => (input: any) =>
    updateSettings({ [settingName]: form.resolveValue(input) });

  return (
    <>
      <LanguageSetting />

      <SettingsField
        connectLabel
        label={__('Minimize on close')}
        subLabel={__(
          'Minimize the wallet when closing the window instead of closing it.'
        )}
      >
        <Switch
          checked={settings.minimizeOnClose}
          onCheckedChange={updateHandlers('minimizeOnClose')}
        />
      </SettingsField>

      <SettingsField
        connectLabel
        label={__('Open on startup')}
        subLabel={__('Open the wallet when ever the OS starts.')}
      >
        <Switch
          checked={settings.openOnStart}
          onCheckedChange={toggleOpenOnStart}
        />
      </SettingsField>

      <SettingsField
        connectLabel
        label={
          <span>
            <span className="v-align">
              {__('Auto update (Recommended)')}{' '}
              {!settings.autoUpdate && <WarningIcon icon={warningIcon} />}
            </span>
          </span>
        }
        subLabel={
          <div>
            {__(
              'Automatically check for new versions and notify if a new version is available.'
            )}
          </div>
        }
      >
        <Switch
          checked={settings.autoUpdate}
          onCheckedChange={handleAutoUpdateChange}
        />
      </SettingsField>

      <SettingsField
        connectLabel
        label={__('Allow Pre-releases')}
        subLabel={
          <div>
            {__(
              'Accept pre-release versions (e.g. alpha, beta) when checking for updates.'
            )}
          </div>
        }
      >
        {LOCK_TESTNET ? (
          <Button
            onClick={async () => {
              const confirmed = await confirm({
                question: 'Are you sure you want to move to mainnet?',
                note: 'This will install the latest Alpha version of the wallet',
              });
              if (confirmed) {
                migrateToMainnet();
              }
            }}
          >
            Migrate to Mainnet
          </Button>
        ) : (
          <Switch
            checked={settings.allowPrerelease}
            onCheckedChange={(checked) => setAllowPrerelease(checked)}
          />
        )}
      </SettingsField>

      <SettingsField
        connectLabel
        label={__('Send anonymous usage data')}
        subLabel={__(
          'Send anonymous usage data to allow the Nexus developers to improve the wallet.'
        )}
      >
        <Switch
          checked={settings.sendUsageData}
          onCheckedChange={(checked) => {
            if (checked) {
              UT.EnableAnalytics();
            } else {
              UT.DisableAnalytics();
            }
            updateSettings({ sendUsageData: checked });
          }}
        />
      </SettingsField>

      <SettingsField
        connectLabel
        label={__('Developer mode')}
        subLabel={__(
          'Developer mode is a startup-only setting and cannot be changed while the wallet is running.'
        )}
      >
        <Switch checked={settings.devMode} disabled />
      </SettingsField>

      <div style={{ display: settings.devMode ? 'block' : 'none' }}>
        <SettingsField
          indent={1}
          connectLabel
          label={__('Module open source policy')}
          subLabel={__(
            "Only modules which have valid open source repositories are allowed to be installed and run. You can disable this option to test run the modules that you're developing"
          )}
        >
          <Switch
            checked={settings.verifyModuleSource}
            onCheckedChange={toggleVerifyModuleSource}
          />
        </SettingsField>
        <SettingsField
          indent={1}
          connectLabel
          label={__('Allow SymLink')}
          subLabel={__(
            'Allow the presence of SymLinks in the module directory'
          )}
        >
          <Switch
            checked={settings.allowSymLink}
            onCheckedChange={updateHandlers('allowSymLink')}
          />
        </SettingsField>
      </div>
    </>
  );
}
