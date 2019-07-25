// External
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { remote } from 'electron';
import fs from 'fs';
import styled from '@emotion/styled';
import https from 'https';

// Internal
import googleanalytics from 'scripts/googleanalytics';
import { updateSettings } from 'actions/settings';
import { updateTheme, resetColors } from 'actions/theme';
import { switchSettingsTab } from 'actions/ui';
import SettingsField from 'components/SettingsField';
import Button from 'components/Button';
import Switch from 'components/Switch';
import Select from 'components/Select';
import Icon from 'components/Icon';
import { showNotification } from 'actions/overlays';
import NexusAddress from 'components/NexusAddress';
import SettingsContainer from 'components/SettingsContainer';
import warningIcon from 'images/warning.sprite.svg';
import { walletDataDir } from 'consts/paths';
import { webGLAvailable } from 'consts/misc';

import ColorPicker from './ColorPicker';
import BackgroundPicker from './BackgroundPicker';
import ThemePicker from './ThemePicker';

import DarkTheme from './Dark.json';
import LightTheme from './Light.json';

const overviewDisplays = [
  { value: 'standard', display: 'Standard' },
  { value: 'miner', display: 'Miner' },
  // { value: 'minimalist', display: 'Minimalist' },
  { value: 'balHidden', display: 'Hidden Balance' },
  { value: 'none', display: 'None' },
];

const mapStateToProps = ({
  settings: { renderGlobe, locale, addressStyle, overviewDisplay },
  myAccounts,
  theme,
}) => {
  return {
    renderGlobe,
    theme,
    locale,
    addressStyle,
    myAccounts,
    overviewDisplay,
  };
};
const mapDispatchToProps = dispatch => ({
  setRenderGlobe: renderGlobe => dispatch(updateSettings({ renderGlobe })),
  setOverviewDisplay: overviewDisplay =>
    dispatch(updateSettings({ overviewDisplay })),
  setAddressStyle: addressStyle => {
    googleanalytics.SendEvent(
      'Settings',
      'Style',
      'setAddressStyle',
      addressStyle
    );
    dispatch(updateSettings({ addressStyle }));
  },
  updateTheme: updates => dispatch(updateTheme(updates)),
  resetColors: () => dispatch(resetColors()),
  switchSettingsTab: tab => dispatch(switchSettingsTab(tab)),
  showNotification: (...args) => dispatch(showNotification(...args)),
});

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
@connect(
  mapStateToProps,
  mapDispatchToProps
)
class SettingsStyle extends Component {
  /**
   *Creates an instance of SettingsStyle.
   * @param {*} props
   * @memberof SettingsStyle
   */
  constructor(props) {
    super(props);
    props.switchSettingsTab('Style');
  }

  state = {
    previousCustom: {},
    DarkTheme: DarkTheme,
    LightTheme: LightTheme,
    sampleAddress: '000000000000000000000000000000000000000000000000000',
  };

  /**
   * Component Mount Callback
   *
   * @memberof SettingsStyle
   */
  componentDidMount() {
    if (this.props.theme.defaultStyle == 'Dark') {
      this.setThemeSelector(0);
    } else if (this.props.theme.defaultStyle == 'Light') {
      this.setThemeSelector(1);
    } else {
      this.setThemeSelector(2);
    }
    this.GetUsersDefaultAddress();
  }

  /**
   * Get the user's default address and save it to state, to be used on the Address Style Field
   *
   * @memberof SettingsStyle
   */
  GetUsersDefaultAddress() {
    let myAddress = '000000000000000000000000000000000000000000000000000';
    try {
      myAddress = this.props.myAccounts[0].addresses[0];
    } catch (e) {
      console.error(e);
    }
    this.setState({
      sampleAddress: myAddress,
    });
  }

  /**
   * Toggle The Globe
   *
   * @memberof SettingsStyle
   */
  toggleGlobeRender = e => {
    this.props.setRenderGlobe(e.target.checked);
  };

  /**
   * Set New Wallpaper
   *
   * @memberof SettingsStyle
   */
  setWallpaper = (path, defaultStyle) => {
    defaultStyle = defaultStyle ? defaultStyle : this.props.theme.defaultStyle;
    this.props.updateTheme({ defaultStyle: defaultStyle, wallpaper: path });
    if (path || defaultStyle.endsWith('Custom')) {
      this.setThemeSelector(2);
      if (path) {
        this.props.updateTheme({ defaultStyle: 'Custom' });
      }
    }
  };

  /**
   * Set Color
   *
   * @memberof SettingsStyle
   */
  setColor = (key, value) => {
    this.setToCustom();
    const defaultStyle = this.props.theme.defaultStyle;
    const wasOnDefault =
      defaultStyle === 'Dark' ||
      defaultStyle === 'Light' ||
      defaultStyle.endsWith('Custom');
    this.props.updateTheme({
      [key]: value,
      defaultStyle: wasOnDefault
        ? defaultStyle.endsWith('Custom')
          ? defaultStyle
          : defaultStyle + 'Custom'
        : 'Custom',
    });
  };

  /**
   * Reset Colors
   *
   * @memberof SettingsStyle
   */
  resetColors = () => {
    //Dont think we need this anymore
    this.props.resetColors();
    this.props.showNotification(
      __('Color scheme has been reset to default'),
      'success'
    );
  };

  /**
   * Load Custom Theme from json File
   *
   * @memberof SettingsStyle
   */
  loadCustomTheme = filepath => {
    const content = fs.readFileSync(filepath);
    let customTheme;
    try {
      customTheme = JSON.parse(content);
      if (
        customTheme.wallpaper.startsWith('https') ||
        customTheme.wallpaper.startsWith('http')
      ) {
        const wallpaperPathSplit = customTheme.wallpaper.split('.');
        const fileEnding = wallpaperPathSplit[wallpaperPathSplit.length - 1];
        const file = fs.createWriteStream(
          walletDataDir + '/wallpaper.' + fileEnding
        );
        this.wallpaperRequest = https
          .get(customTheme.wallpaper)
          .setTimeout(10000)
          .on('response', response => {
            response.pipe(file);
            let onFinish = () => {
              file.close(response => {
                console.log('FInished Downloading');
                this.setWallpaper(file.path);
              });
            };
            onFinish.bind(this);
            file.on('finish', () => onFinish());
          })
          .on('error', error => {
            this.setWallpaper('');
          })
          .on('timeout', timeout => {
            this.setWallpaper('');
          });
      }
    } catch (err) {
      this.props.showNotification(
        __('Invalid file format! Custom theme file must be in JSON'),
        'error'
      );
    }
    customTheme.defaultStyle = 'Custom';
    this.props.updateTheme(customTheme);
  };

  /**
   * Open Dialog for Picking Theme
   *
   * @memberof SettingsStyle
   */
  openPickThemeFileDialog = () => {
    remote.dialog.showOpenDialog(
      {
        title: __('Select custom theme file'),
        properties: ['openFile'],
        filters: [{ name: 'Theme JSON', extensions: ['json'] }],
      },
      files => {
        if (files && files.length > 0) {
          this.loadCustomTheme(files[0]);
        }
      }
    );
  };

  /**
   * Export Theme File
   *
   * @memberof SettingsStyle
   */
  exportThemeFileDialog = () => {
    remote.dialog.showSaveDialog(
      null,
      {
        title: 'Save Theme File',
        properties: ['saveFile'],
        filters: [{ name: 'Theme JSON', extensions: ['json'] }],
      },
      path => {
        console.log(path);
        fs.copyFile(walletDataDir + '/theme.json', path, err => {
          if (err) {
            console.error(err);
            this.props.showNotification(err, 'error');
          }
          this.props.showNotification(__('Theme exported'), 'success');
        });
      }
    );
  };

  /**
   * Press Dark Theme Button
   *
   * @memberof SettingsStyle
   */
  pressDarkTheme = () => {
    this.props.updateTheme(DarkTheme);
  };
  /**
   * Press Light Theme Button
   *
   * @memberof SettingsStyle
   */
  pressLightTheme = () => {
    this.props.updateTheme(LightTheme);
  };
  /**
   * Press Custom theme button
   *
   * @memberof SettingsStyle
   */
  pressCustomTheme = () => {
    if (this.state.previousCustom != {}) {
      this.props.updateTheme(this.state.previousCustom);
    }
  };
  /**
   * Press Reset Button
   *
   * @memberof SettingsStyle
   */
  pressResetTheme = () => {
    this.props.updateTheme(DarkTheme);
    this.setThemeSelector(0);
    this.props.showNotification(
      __('Theme has been reset to default'),
      'success'
    );
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
  setThemeSelector = selectorIndex => {};

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
      addressStyle,
      setAddressStyle,
      overviewDisplay,
      setOverviewDisplay,
    } = this.props;

    return (
      <SettingsContainer>
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
          label="Nexus Addresses format"
          subLabel="Choose your Nexus Address display preference"
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
              address={this.state.sampleAddress}
              label="Sample Address"
            />
            <AddressStyleNote>
              <Icon icon={warningIcon} className="space-right" />
              <span className="v-align">This is your Default Address</span>
            </AddressStyleNote>
          </div>
        </SettingsField>

        <SettingsField label="Theme" subLabel="Select Wallet Theme">
          <ThemePicker
            parentTheme={theme}
            darkCallback={this.pressDarkTheme}
            lightCallback={this.pressLightTheme}
            customCallback={this.pressCustomTheme}
            resetCallback={this.pressResetTheme}
            saveCustomCallback={this.savePreviousCustomTheme}
            handleOnSetCustom={e => (this.setToCustom = e)}
            handleSetSelector={e => (this.setThemeSelector = e)}
          />
        </SettingsField>

        <SettingsField
          label={__('Background')}
          subLabel={__('Customize your background wallpaper')}
        >
          <BackgroundPicker
            wallpaper={theme.wallpaper}
            defaultStyle={theme.defaultStyle}
            onChange={this.setWallpaper}
          />
        </SettingsField>

        <SettingsField label={__('Color scheme')} />

        <SettingsField indent={1} label={__('Background Color')}>
          <ColorPicker colorName="background" onChange={this.setColor} />
        </SettingsField>
        <SettingsField indent={1} label={__('Foreground Color')}>
          <ColorPicker colorName="foreground" onChange={this.setColor} />
        </SettingsField>
        <SettingsField indent={1} label={__('Primary Color')}>
          <ColorPicker colorName="primary" onChange={this.setColor} />
        </SettingsField>
        <SettingsField indent={1} label={__('Primary Color Accent')}>
          <ColorPicker colorName="primaryAccent" onChange={this.setColor} />
        </SettingsField>
        <SettingsField indent={1} label={__('Danger Color')}>
          <ColorPicker colorName="danger" onChange={this.setColor} />
        </SettingsField>
        <SettingsField indent={1} label={__('Danger Color Accent')}>
          <ColorPicker colorName="dangerAccent" onChange={this.setColor} />
        </SettingsField>
        <SettingsField indent={1} label={__('Globe Color')}>
          <ColorPicker colorName="globeColor" onChange={this.setColor} />
        </SettingsField>
        <SettingsField indent={2} label={__('Globe Pillar Color')}>
          <ColorPicker colorName="globePillarColor" onChange={this.setColor} />
        </SettingsField>
        <SettingsField indent={2} label={__('Globe Arch Color')}>
          <ColorPicker colorName="globeArchColor" onChange={this.setColor} />
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
      </SettingsContainer>
    );
  }
}
export default SettingsStyle;
