// External
import { useAtomValue } from 'jotai';

// Internal
import SettingsField from 'components/SettingsField';
import Button from 'components/Button';
import Switch from 'components/Switch';
import Select, { SelectOption } from 'components/Select';
import NexusAddress from 'components/NexusAddress';
import { updateSettings, settingsAtom } from 'lib/settings';
import { showNotification } from 'lib/ui';
import { loadCustomTheme } from 'lib/theme';
import { accountsQuery } from 'lib/user';
import { webGLAvailable } from 'consts/misc';
import memoize from 'utils/memoize';

import { useSettingsTab } from '../atoms';
import ColorPicker from './ColorPicker';
import BackgroundPicker from './BackgroundPicker';
import ThemePicker from './ThemePicker';
import { Account } from 'lib/api';
import { AddressStyle, OverviewDisplay } from 'lib/settings/defaultSettings';

__ = __context('Settings.Style');

const overviewDisplays = [
  { value: 'standard', display: 'Standard' },
  { value: 'miner', display: 'Miner' },
  // { value: 'minimalist', display: 'Minimalist' },
  // { value: 'balHidden', display: 'Hidden Balance' },
  { value: 'none', display: 'None' },
];

const addressStyleOptions = [
  { value: 'segmented', display: 'Segmented' },
  { value: 'truncateMiddle', display: 'Truncate middle' },
  { value: 'raw', display: 'Raw' },
];

const getTritiumDefaultAddress = memoize((accounts?: Account[]) => {
  const account = accounts?.find((a) => a.name === 'default');
  return account?.address;
});

const setRenderGlobe = (renderGlobe: boolean) =>
  updateSettings({ renderGlobe });
const setOverviewDisplay = (overviewDisplay: OverviewDisplay) =>
  updateSettings({ overviewDisplay });
const setAddressStyle = (addressStyle: AddressStyle) =>
  updateSettings({ addressStyle });

async function openPickThemeFileDialog() {
  await loadCustomTheme();
}

async function exportThemeFileDialog() {
  try {
    const exported = await window.nexusElectron.theme.exportToDialog();
    if (exported) {
      showNotification(__('Theme exported'), 'success');
    }
  } catch (err: any) {
    showNotification(err?.message, 'error');
  }
}

export default function SettingsStyle() {
  useSettingsTab('Style');
  const settings = useAtomValue(settingsAtom);
  const accounts = accountsQuery.use();
  const defaultAddress = getTritiumDefaultAddress(accounts);

  return (
    <>
      <SettingsField
        connectLabel
        label={__('Render globe')}
        subLabel={
          <div>
            {__('Render the globe on the Overview page.')}
            {!webGLAvailable && (
              <div className="error">
                {__('Your computer does not support OPENGL 2.0')}
              </div>
            )}
          </div>
        }
      >
        <Switch
          disabled={!webGLAvailable}
          checked={settings.renderGlobe}
          onChange={(e) => {
            setRenderGlobe(e.target.checked);
          }}
        />
      </SettingsField>

      <SettingsField label={__('Overview Display')}>
        <Select
          value={settings.overviewDisplay}
          onChange={setOverviewDisplay}
          options={overviewDisplays as SelectOption<OverviewDisplay>[]}
          style={{ maxWidth: 260 }}
        />
      </SettingsField>

      <SettingsField
        connectLabel
        label={__('Hide Overview balances')}
        subLabel={
          <div>{__('Hide the balances on the Overview page for privacy.')}</div>
        }
      >
        <Switch
          checked={settings.hideOverviewBalances}
          onChange={(e) => {
            updateSettings({ hideOverviewBalances: e.target.checked });
          }}
        />
      </SettingsField>

      <SettingsField
        label={__('Nexus Addresses format')}
        subLabel={__('Choose your Nexus Address display preference')}
      >
        <>
          <div>
            <Select
              value={settings.addressStyle}
              onChange={setAddressStyle}
              options={addressStyleOptions as SelectOption<AddressStyle>[]}
            />
          </div>
          <div className="mt1">
            <NexusAddress
              address={
                defaultAddress ||
                '000000000000000000000000000000000000000000000000000'
              }
              label={__('Sample Address')}
            />
          </div>
        </>
      </SettingsField>

      <SettingsField label={__('Wallet theme')}>
        <ThemePicker />
      </SettingsField>

      <SettingsField
        label={__('Background')}
        subLabel={__('Customize your background wallpaper')}
      >
        <BackgroundPicker />
      </SettingsField>

      <SettingsField label={__('Color scheme')}>
        <></>
      </SettingsField>

      <SettingsField indent={1} label={__('Background Color')}>
        <ColorPicker colorName="background" />
      </SettingsField>
      <SettingsField indent={1} label={__('Foreground Color')}>
        <ColorPicker colorName="foreground" />
      </SettingsField>
      <SettingsField indent={1} label={__('Primary Color')}>
        <ColorPicker colorName="primary" />
      </SettingsField>
      <SettingsField indent={1} label={__('Primary Color Accent')}>
        <ColorPicker colorName="primaryAccent" />
      </SettingsField>
      <SettingsField indent={1} label={__('Danger Color')}>
        <ColorPicker colorName="danger" />
      </SettingsField>
      <SettingsField indent={1} label={__('Danger Color Accent')}>
        <ColorPicker colorName="dangerAccent" />
      </SettingsField>
      <SettingsField indent={1} label={__('Globe Color')}>
        <ColorPicker colorName="globeColor" />
      </SettingsField>
      <SettingsField indent={2} label={__('Globe Pillar Color')}>
        <ColorPicker colorName="globePillarColor" />
      </SettingsField>
      <SettingsField indent={2} label={__('Globe Arch Color')}>
        <ColorPicker colorName="globeArchColor" />
      </SettingsField>

      <div style={{ marginTop: '2em' }}>
        <Button onClick={openPickThemeFileDialog}>
          {__('Import custom theme')}
        </Button>
        <Button style={{ marginLeft: '1em' }} onClick={exportThemeFileDialog}>
          {__('Export custom theme')}
        </Button>
      </div>
    </>
  );
}
