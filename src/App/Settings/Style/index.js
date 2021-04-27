// External
import { Component } from 'react';
import { connect } from 'react-redux';
import { ipcRenderer } from 'electron';
import fs from 'fs';
import styled from '@emotion/styled';
import https from 'https';

// Internal
import GA from 'lib/googleAnalytics';
import { updateSettings } from 'lib/settings';
import {
  updateTheme,
  setTheme,
  resetColors,
  darkTheme,
  lightTheme,
  potTheme,
} from 'lib/theme';
import { switchSettingsTab } from 'lib/ui';
import SettingsField from 'components/SettingsField';
import Button from 'components/Button';
import Switch from 'components/Switch';
import Select from 'components/Select';
import Icon from 'components/Icon';
import { showNotification } from 'lib/ui';
import NexusAddress from 'components/NexusAddress';
import warningIcon from 'icons/warning.svg';
import { walletDataDir } from 'consts/paths';
import { webGLAvailable, legacyMode } from 'consts/misc';
import memoize from 'utils/memoize';
import { loadAccounts } from 'lib/user';

import ColorPicker from './ColorPicker';
import BackgroundPicker from './BackgroundPicker';
import ThemePicker from './ThemePicker';

__ = __context('Settings.Style');

const overviewDisplays = [
  { value: 'standard', display: 'Standard' },
  { value: 'miner', display: 'Miner' },
  // { value: 'minimalist', display: 'Minimalist' },
  // { value: 'balHidden', display: 'Hidden Balance' },
  { value: 'none', display: 'None' },
];

const getLegacyDefaultAddress = memoize((myAccounts) => {
  const acc = myAccounts && myAccounts.find((a) => a.account === 'default');
  return acc && acc.addresses && acc.addresses[0];
});
const getTritiumDefaultAddress = memoize((accounts) => {
  const acc = accounts && accounts.find((a) => a.name === 'default');
  return acc && acc.address;
});

const mapStateToProps = ({
  user: { accounts },
  settings: {
    renderGlobe,
    locale,
    addressStyle,
    overviewDisplay,
    hideOverviewBalances,
  },
  myAccounts,
  theme,
}) => {
  return {
    renderGlobe,
    hideOverviewBalances,
    theme,
    locale,
    addressStyle,
    defaultAddress: legacyMode
      ? getLegacyDefaultAddress(myAccounts)
      : getTritiumDefaultAddress(accounts),
    overviewDisplay,
  };
};

const setRenderGlobe = (renderGlobe) => updateSettings({ renderGlobe });
const setOverviewDisplay = (overviewDisplay) =>
  updateSettings({ overviewDisplay });
const setAddressStyle = (addressStyle) => {
  GA.SendEvent('Settings', 'Style', 'setAddressStyle', addressStyle);
  updateSettings({ addressStyle });
};

const addressStyleOptions = [
  { value: 'segmented', display: 'Segmented' },
  { value: 'truncateMiddle', display: 'Truncate middle' },
  { value: 'raw', display: 'Raw' },
];

const AddressStyleNote = styled.div(({ theme }) => ({
  fontSize: '.8em',
  color: theme.mixer(0.5),
  marginTop: '1em',
}));

/**
 * Style Settings in the Style Page
 *
 * @class SettingsStyle
 * @extends {Component}
 */
@connect(mapStateToProps)
class SettingsStyle extends Component {
  /**
   *Creates an instance of SettingsStyle.
   * @param {*} props
   * @memberof SettingsStyle
   */
  constructor(props) {
    super(props);
    switchSettingsTab('Style');
  }

  state = {
    previousCustom: {},
  };

  /**
   * Toggle The Globe
   *
   * @memberof SettingsStyle
   */
  toggleGlobeRender = (e) => {
    setRenderGlobe(e.target.checked);
  };

  toggleHideOverviewBalances = (e) => {
    updateSettings({ hideOverviewBalances: e.target.checked });
  };

  /**
   * Reset Colors
   *
   * @memberof SettingsStyle
   */
  resetColors = () => {
    //Dont think we need this anymore
    resetColors();
    showNotification(__('Color scheme has been reset to default'), 'success');
  };

  /**
   * Open Dialog for Picking Theme
   *
   * @memberof SettingsStyle
   */
  openPickThemeFileDialog = async () => {
    const files = await ipcRenderer.invoke('show-open-dialog', {
      title: __('Select custom theme file'),
      properties: ['openFile'],
      filters: [{ name: 'Theme JSON', extensions: ['json'] }],
    });
    if (files && files.length > 0) {
      this.loadCustomTheme(files[0]);
    }
  };

  /**
   * Export Theme File
   *
   * @memberof SettingsStyle
   */
  exportThemeFileDialog = async () => {
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
  };

  /**
   * Press Dark Theme Button
   *
   * @memberof SettingsStyle
   */
  pressDarkTheme = () => {
    setTheme(darkTheme);
  };
  /**
   * Press Light Theme Button
   *
   * @memberof SettingsStyle
   */
  pressLightTheme = () => {
    setTheme(lightTheme);
  };

  pressPotTheme = () => {
    setTheme(potTheme);
  };

  /**
   * Press Custom theme button
   *
   * @memberof SettingsStyle
   */
  pressCustomTheme = () => {
    if (this.state.previousCustom != {}) {
      setTheme(this.state.previousCustom);
    }
  };
  /**
   * Press Reset Button
   *
   * @memberof SettingsStyle
   */
  pressResetTheme = () => {
    setTheme(darkTheme);
    this.setThemeSelector(0);
    showNotification(__('Theme has been reset to default'), 'success');
  };

  /**
   * Save Previous Custom Theme to state
   *
   * @memberof SettingsStyle
   */
  savePreviousCustomTheme = () => {
    this.setState({ previousCustom: this.props.theme }, () => {
      console.log(this.state);
    });
  };

  /**
   * Set To Custom, this is used by background picker
   *
   * @memberof SettingsStyle
   */
  setToCustom = () => {
    //console.log("Set To Custom")
  };

  /**
   * Set theme button, used by theme slector
   *
   * @memberof SettingsStyle
   */
  setThemeSelector = (selectorIndex) => {};

  /**
   * Component's Renderable JSX
   *
   * @returns
   * @memberof SettingsStyle
   */
  render() {
    const {
      theme,
      renderGlobe,
      hideOverviewBalances,
      defaultAddress,
      addressStyle,
      overviewDisplay,
    } = this.props;

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
            checked={renderGlobe}
            onChange={this.toggleGlobeRender}
          />
        </SettingsField>

        <SettingsField label={__('Overview Display')}>
          <Select
            value={overviewDisplay}
            onChange={setOverviewDisplay}
            options={overviewDisplays}
            style={{ maxWidth: 260 }}
          />
        </SettingsField>

        <SettingsField
          connectLabel
          label={__('Hide Overview balances')}
          subLabel={
            <div>
              {__('Hide the balances on the Overview page for privacy.')}
            </div>
          }
        >
          <Switch
            checked={hideOverviewBalances}
            onChange={this.toggleHideOverviewBalances}
          />
        </SettingsField>

        <SettingsField
          label={__('Nexus Addresses format')}
          subLabel={__('Choose your Nexus Address display preference')}
        >
          <div>
            <Select
              value={addressStyle}
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

        <SettingsField label={__('Theme preset')}>
          <ThemePicker
            parentTheme={theme}
            darkCallback={this.pressDarkTheme}
            lightCallback={this.pressLightTheme}
            potCallback={this.pressPotTheme}
            customCallback={this.pressCustomTheme}
            resetCallback={this.pressResetTheme}
            saveCustomCallback={this.savePreviousCustomTheme}
            handleOnSetCustom={(e) => (this.setToCustom = e)}
            handleSetSelector={(e) => (this.setThemeSelector = e)}
          />
        </SettingsField>

        <SettingsField
          label={__('Background')}
          subLabel={__('Customize your background wallpaper')}
        >
          <BackgroundPicker />
        </SettingsField>

        <SettingsField label={__('Color scheme')} />

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
          <Button onClick={this.openPickThemeFileDialog}>
            {__('Import custom theme')}
          </Button>
          <Button
            style={{ marginLeft: '1em' }}
            onClick={this.exportThemeFileDialog}
          >
            {__('Export custom theme')}
          </Button>
        </div>
      </>
    );
  }
}
export default SettingsStyle;
