// External
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { remote } from 'electron';
import fs from 'fs';
import styled from '@emotion/styled';
import https from 'https';

// Internal
import googleanalytics from 'scripts/googleanalytics';
import { updateSettings } from 'actions/settingsActionCreators';
import { updateTheme, resetColors } from 'actions/themeActionCreators';
import Text, { translate } from 'components/Text';
import SettingsField from 'components/SettingsField';
import Button from 'components/Button';
import Switch from 'components/Switch';
import Select from 'components/Select';
import Icon from 'components/Icon';
import UIController from 'components/UIController';
import NexusAddress from 'components/NexusAddress';
import SettingsContainer from 'components/SettingsContainer';
import warningIcon from 'images/warning.sprite.svg';

import ColorPicker from './ColorPicker';
import BackgroundPicker from './BackgroundPicker';
import configuration from 'api/configuration';
import ThemePicker from './ThemePicker';

import DarkTheme from './Dark.json';
import LightTheme from './Light.json';

const mapStateToProps = ({
  settings: { renderGlobe, locale, addressStyle },
  overview: { webGLEnabled },
  theme,
}) => {
  return {
    renderGlobe,
    webGLEnabled,
    theme,
    locale,
    addressStyle,
  };
};
const mapDispatchToProps = dispatch => ({
  setRenderGlobe: renderGlobe => dispatch(updateSettings({ renderGlobe })),
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
});

const addressStyleOptions = [
  { value: 'segmented', display: 'Segmented' },
  { value: 'truncateMiddle', display: 'Truncate middle' },
  { value: 'raw', display: 'Raw' },
];

const sampleAddress = '2R9SJ4jyyU1WYrsR7Je83WLMaUx2YMRURH2Z6Qro6n46SNLufUc';

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
  state = {
    previousCustom: {},
    DarkTheme: DarkTheme,
    LightTheme: LightTheme,
  };

  componentDidMount() {
    if (this.props.theme.defaultStyle == 'Dark') {
      this.setThemeSelector(0);
    } else if (this.props.theme.defaultStyle == 'Light') {
      this.setThemeSelector(1);
    } else {
      this.setThemeSelector(2);
    }
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
    const wasOnDefault = defaultStyle === 'Dark'
     || defaultStyle === 'Light'
     || defaultStyle.endsWith('Custom');
    this.props.updateTheme({
      [key]: value,
      defaultStyle: wasOnDefault? ( defaultStyle.endsWith('Custom')? defaultStyle : defaultStyle + 'Custom') : 'Custom',
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
    UIController.showNotification(
      <Text id="Settings.ResetColorNoti" />,
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
          configuration.GetAppDataDirectory() + '/wallpaper.' + fileEnding
        );
        this.wallpaperRequest = https
          .get(customTheme.wallpaper)
          .setTimeout(10000)
          .on('response', response => {
            response.pipe(file);
            let onFinish = () => {
              file.close(response => {
                console.log(this);
                console.log('FInished DOwnloading');
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
      UIController.showNotification(
        <Text id="Settings.Errors.InvalidJSON" />,
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
        title: translate('Settings.SelectCustomTheme', this.props.locale),
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
        fs.copyFile(
          configuration.GetAppDataDirectory() + '/theme.json',
          path,
          err => {
            if (err) {
              console.error(err);
              UIController.showNotification(err, 'error');
            }
            UIController.showNotification(
              <Text id="Settings.ExportTheme" />,
              'success'
            );
          }
        );
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
    UIController.showNotification(
      <Text id="Settings.ResetThemeNoti" />,
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
   * React Render
   *
   * @returns
   * @memberof SettingsStyle
   */
  render() {
    const {
      theme,
      renderGlobe,
      webGLEnabled,
      addressStyle,
      setAddressStyle,
    } = this.props;

    return (
      <SettingsContainer>
        <SettingsField
          connectLabel
          label={<Text id="Settings.RenderGlobe" />}
          subLabel={
            <div>
              <Text id="ToolTip.RenderGlobe" />
              {!webGLEnabled && (
                <div className="error">
                  <Text id="ToolTip.RenderGlobeOpenGLFail" />
                </div>
              )}
            </div>
          }
        >
          <Switch
            disabled={!webGLEnabled}
            checked={renderGlobe}
            onChange={this.toggleGlobeRender}
          />
        </SettingsField>

        <SettingsField
          label="Nexus Addresses format"
          subLabel="Choose which format Nexus Addresses should be displayed in"
        >
          <div>
            <Select
              value={addressStyle}
              onChange={setAddressStyle}
              options={addressStyleOptions}
            />
          </div>
          <div className="mt1">
            <NexusAddress address={sampleAddress} label="Sample Address" />
            <AddressStyleNote>
              <Icon icon={warningIcon} spaceRight />
              <span className="v-align">
                This address is just a sample one, please do NOT send your NXS
                to it
              </span>
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
          label={<Text id="Settings.Background" />}
          subLabel={<Text id="Settings.BackgroundSubLabel" />}
        >
          <BackgroundPicker
            wallpaper={theme.wallpaper}
            defaultStyle={theme.defaultStyle}
            onChange={this.setWallpaper}
          />
        </SettingsField>

        <SettingsField label={<Text id="Settings.ColorScheme" />} />

        <SettingsField indent={1} label={<Text id="Cp.PBC" />}>
          <ColorPicker colorName="background" onChange={this.setColor} />
        </SettingsField>
        <SettingsField indent={1} label={<Text id="Cp.TC" />}>
          <ColorPicker colorName="foreground" onChange={this.setColor} />
        </SettingsField>
        <SettingsField indent={1} label={<Text id="Cp.PC" />}>
          <ColorPicker colorName="primary" onChange={this.setColor} />
        </SettingsField>
        <SettingsField indent={1} label={<Text id="Cp.PCA" />}>
          <ColorPicker colorName="primaryAccent" onChange={this.setColor} />
        </SettingsField>
        <SettingsField indent={1} label={<Text id="Cp.ER" />}>
          <ColorPicker colorName="danger" onChange={this.setColor} />
        </SettingsField>
        <SettingsField indent={1} label={<Text id="Cp.ERA" />}>
          <ColorPicker colorName="dangerAccent" onChange={this.setColor} />
        </SettingsField>
        <SettingsField indent={1} label={<Text id="Cp.GC" />}>
          <ColorPicker colorName="globeColor" onChange={this.setColor} />
        </SettingsField>
        <SettingsField indent={2} label={<Text id="Cp.GPC" />}>
          <ColorPicker colorName="globePillarColor" onChange={this.setColor} />
        </SettingsField>
        <SettingsField indent={2} label={<Text id="Cp.GAC" />}>
          <ColorPicker colorName="globeArchColor" onChange={this.setColor} />
        </SettingsField>

        <div style={{ marginTop: '2em' }}>
          <Button onClick={this.openPickThemeFileDialog}>
            <Text id="Settings.PickThemeFile" />
          </Button>
          <Button
            style={{ marginLeft: '1em' }}
            onClick={this.exportThemeFileDialog}
          >
            <Text id="Settings.ThemeFileExport" />
          </Button>
        </div>
      </SettingsContainer>
    );
  }
}
export default SettingsStyle;
