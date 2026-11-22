// External
import { useEffect } from 'react';
import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';
import Group from '../SettingsGroup';
import { useSelector } from 'react-redux';
import { ipcRenderer } from 'electron';
import fs from 'fs';

// Internal
import SettingsField from 'components/SettingsField';
import Button from 'components/Button';
import Switch from 'components/Switch';
import Select from 'components/Select';
import NexusAddress from 'components/NexusAddress';
import UT from 'lib/usageTracking';
import { updateSettings } from 'lib/settings';
import { switchSettingsTab, showNotification } from 'lib/ui';
import { loadCustomTheme } from 'lib/theme';
import { refreshAccounts } from 'lib/user';
import { walletDataDir } from 'consts/paths';
import { webGLAvailable } from 'consts/misc';
import memoize from 'utils/memoize';

import ColorPicker from './ColorPicker';
import BackgroundPicker from './BackgroundPicker';
import ThemePicker from './ThemePicker';

__ = __context('Settings.Style');

const StyleSettings = styled.div(({ theme }) => theme.modern ? {
  '.app-setting.picker-setting': { flexDirection: 'column', alignItems: 'stretch', gap: 12 },
  '.app-setting.picker-setting > div': { width: '100%', maxWidth: '100%' },
  '.picker-setting > div > div:first-child': { display: 'flex', flexWrap: 'wrap', gap: 8 },
  '.picker-setting button': { margin: '0 !important', maxWidth: '100%', whiteSpace: 'normal', height: 'auto', minHeight: 34, padding: '7px 12px', overflowWrap: 'anywhere' },
  '.address-setting .mt1': { maxWidth: 480, fontSize: 12, overflowWrap: 'anywhere' },
  '.address-setting .mt1 div': { whiteSpace: 'pre-wrap' },
  '.theme-files': { display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 },
  '.theme-files button': { height: 34, padding: '0 12px', fontSize: 12, borderRadius: 8 },
} : {});

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

const getTritiumDefaultAddress = memoize((accounts) => {
  const account = accounts?.find((a) => a.name === 'default');
  return account?.address;
});

const setRenderGlobe = (renderGlobe) => updateSettings({ renderGlobe });
const setOverviewDisplay = (overviewDisplay) =>
  updateSettings({ overviewDisplay });
const setAddressStyle = (addressStyle) => updateSettings({ addressStyle });

async function openPickThemeFileDialog() {
  const files = await ipcRenderer.invoke('show-open-dialog', {
    title: __('Select custom theme file'),
    properties: ['openFile'],
    filters: [{ name: 'Theme JSON', extensions: ['json'] }],
  });
  if (files?.[0]) {
    loadCustomTheme(files[0]);
  }
}

async function exportThemeFileDialog() {
  const path = await ipcRenderer.invoke('show-save-dialog', {
    title: 'Save Theme File',
    properties: ['saveFile'],
    filters: [{ name: 'Theme JSON', extensions: ['json'] }],
  });
  if (!path) return;
  fs.copyFile(walletDataDir + '/theme.json', path, (err) => {
    if (err) {
      console.error(err);
      showNotification(err, 'error');
    }
    showNotification(__('Theme exported'), 'success');
  });
}

export default function SettingsStyle() {
  const { modern } = useTheme();
  const settings = useSelector((state) => state.settings);
  const defaultAddress = useSelector((state) =>
    getTritiumDefaultAddress(state.user.accounts)
  );
  useEffect(() => {
    switchSettingsTab('Style');
    if (!defaultAddress) {
      refreshAccounts();
    }
  }, []);

  return (
    <StyleSettings>
      <Group title={__('Overview and addresses')}>
      {modern && <SettingsField className="app-setting select-setting"
        label={__('Overview layout')}
        subLabel={__('3D Globe preserves the original overview with metrics. Dashboard shows the peer map, wallet summary, and recent activity.')}
      >
        <Select className="preference-select" skin="filled-inverted"
          value={settings.modernOverviewLayout || 'map'}
          onChange={(modernOverviewLayout) => updateSettings({ modernOverviewLayout })}
          options={[
            { value: 'map', display: __('Dashboard') },
            { value: 'globe', display: __('3D Globe') },
          ]}
        />
      </SettingsField>}
      <SettingsField className="app-setting"
        connectLabel
        label={modern ? __('Render peer visualization') : __('Render globe')}
        subLabel={
          <div>
            {modern ? __('Render the selected 3D layout on the Overview page.') : __('Render the globe on the Overview page.')}
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

      <SettingsField className="app-setting select-setting" label={__('Overview Display')}>
        <Select className="preference-select" skin={modern ? 'filled-inverted' : 'underline'}
          value={settings.overviewDisplay}
          onChange={setOverviewDisplay}
          options={overviewDisplays}
          style={modern ? undefined : { maxWidth: 260 }}
        />
      </SettingsField>

      <SettingsField className="app-setting"
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

      <SettingsField className="app-setting picker-setting address-setting"
        label={__('Nexus Addresses format')}
        subLabel={__('Choose your Nexus Address display preference')}
      >
        <div>
          <Select className="preference-select" skin={modern ? 'filled-inverted' : 'underline'}
            value={settings.addressStyle}
            onChange={setAddressStyle}
            options={addressStyleOptions}
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
      </SettingsField>

      </Group>
      <Group title={__('Theme and background')}>
      <SettingsField className="app-setting picker-setting" label={__('Wallet theme')}>
        <ThemePicker />
      </SettingsField>

      {modern && <SettingsField className="app-setting"
        connectLabel
        label={__('Auto-hide menu')}
        subLabel={__('Hide the sidebar until you move the pointer to the left edge. Keyboard focus also reveals the menu.')}
      >
        <Switch
          checked={!!settings.autoHideNavigation}
          onChange={(e) => updateSettings({ autoHideNavigation: e.target.checked })}
        />
      </SettingsField>}

      <SettingsField className="app-setting picker-setting"
        label={__('Background')}
        subLabel={__('Customize your background wallpaper')}
      >
        <BackgroundPicker />
      </SettingsField>

      </Group>
      <Group title={__('Color scheme')}>
      {!modern && <SettingsField label={__('Color scheme')} />}

      <SettingsField className="app-setting" indent={1} label={__('Background Color')}>
        <ColorPicker colorName="background" />
      </SettingsField>
      <SettingsField className="app-setting" indent={1} label={__('Foreground Color')}>
        <ColorPicker colorName="foreground" />
      </SettingsField>
      <SettingsField className="app-setting" indent={1} label={__('Primary Color')}>
        <ColorPicker colorName="primary" />
      </SettingsField>
      <SettingsField className="app-setting" indent={1} label={__('Primary Color Accent')}>
        <ColorPicker colorName="primaryAccent" />
      </SettingsField>
      <SettingsField className="app-setting" indent={1} label={__('Danger Color')}>
        <ColorPicker colorName="danger" />
      </SettingsField>
      <SettingsField className="app-setting" indent={1} label={__('Danger Color Accent')}>
        <ColorPicker colorName="dangerAccent" />
      </SettingsField>
      <SettingsField className="app-setting" indent={1} label={__('Globe and map color')}
        subLabel={__('Globe surface and dashboard map land, outlines, and glow.')}>
        <ColorPicker colorName="globeColor" />
      </SettingsField>
      <SettingsField className="app-setting" indent={2} label={__('Globe and map peer color')}
        subLabel={__('Peer pillars and new-peer pulses on both the globe and dashboard map.')}>
        <ColorPicker colorName="globePillarColor" />
      </SettingsField>
      {!modern && <SettingsField className="app-setting" indent={2} label={__('Globe connection color')}
        subLabel={__('Connection arcs between peers on the globe.')}>
        <ColorPicker colorName="globeArchColor" />
      </SettingsField>}

      </Group>
      <Group title={__('Theme files')}>
      <div className="theme-files" style={modern ? undefined : { marginTop: '2em' }}>
        <Button onClick={openPickThemeFileDialog}>
          {__('Import custom theme')}
        </Button>
        <Button style={modern ? undefined : { marginLeft: '1em' }} onClick={exportThemeFileDialog}>
          {__('Export custom theme')}
        </Button>
      </div>
      </Group>
    </StyleSettings>
  );
}
