// External
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import googleanalytics from 'scripts/googleanalytics';
import styled from '@emotion/styled';

// Internal
import * as TYPE from 'actions/actiontypes';
import { GetSettings, SaveSettings } from 'api/settings';
import SettingsField from 'components/SettingsField';
import Button from 'components/Button';
import Switch from 'components/Switch';
import UIContext from 'context/ui';
import ColorPicker from './ColorPicker';

const StyleSettings = styled.div({
  maxWidth: 750,
  margin: '0 auto',
});

// React-Redux mandatory methods
const mapStateToProps = state => {
  return {
    ...state.common,
    ...state.settings,
    ...state.overview,
  };
};
const mapDispatchToProps = dispatch => ({
  setSettings: settings =>
    dispatch({ type: TYPE.GET_SETTINGS, payload: settings }),
  OpenModal: type => {
    dispatch({ type: TYPE.SHOW_MODAL, payload: type });
  },
  CloseModal: () => dispatch({ type: TYPE.HIDE_MODAL }),
  SetWalpaper: path => dispatch({ type: TYPE.SET_WALLPAPER, payload: path }),
  CustomizeStyling: hex =>
    dispatch({ type: TYPE.CUSTOMIZE_STYLING, payload: hex }),
  ResetStyle: () => dispatch({ type: TYPE.RESET_CUSTOM_STYLING }),
  ToggleGlobeRender: () => dispatch({ type: TYPE.TOGGLE_GLOBE_RENDER }),
});

class SettingsStyle extends Component {
  static contextType = UIContext;

  // Class Methods
  constructor() {
    super();

    this.updateWallpaper = this.updateWallpaper.bind(this);
  }

  updateWallpaper(event) {
    let el = event.target;
    let imagePath = el.files[0].path;
    if (process.platform === 'win32') {
      imagePath = imagePath.replace(/\\/g, '/');
    }
    this.props.SetWalpaper(imagePath);
  }

  handleColorChange(color) {
    let filterSetting;
    let H = color.hsl.h - 196.3;
    let S = 100 + (color.hsl.s * 100 - 100);
    let L = 100 + (color.hsl.l * 100 - 46.9);
    if (color.hex === '#ffffff') {
      filterSetting = 'hue-rotate(0deg) brightness(200%) grayscale(100%)';
    } else if (color.hex === '#000000') {
      filterSetting = 'hue-rotate(0deg) brightness(0%) grayscale(100%)';
    } else {
      filterSetting = `hue-rotate(${H}deg) brightness(${L}%) grayscale(0%) saturate(${S}%)`;
    }
    switch (this.props.selectedColorProp) {
      case 'MC1':
        this.props.ChangeColor1(color.hex);
        break;
      case 'MC2':
        this.props.ChangeColor2(color.hex);
        break;
      case 'MC3':
        this.props.ChangeColor3(color.hex);
        break;
      case 'MC4':
        this.props.ChangeColor4(color.hex);
        break;
      case 'MC5':
        this.props.ChangeColor5(color.hex);
        break;
      case 'NXSlogo':
        this.props.ChangeNexusLogoColor(filterSetting, color.hex);
        break;
      case 'iconMenu':
        this.props.ChangeIconMenuColor(filterSetting, color.hex);
        break;
      case 'footer':
        this.props.ChangeFooterColor(filterSetting, color.hex);
        break;
      case 'footerHover':
        this.props.ChangeFooterHoverColor(filterSetting, color.hex);
        break;
      case 'footerActive':
        this.props.ChangeFooterActiveColor(filterSetting, color.hex);
        break;
      case 'globePillar':
        this.props.ChangeGlobePillarColor(filterSetting, color.hex);
        break;
      case 'globeArch':
        this.props.ChangeGlobeArchColor(filterSetting, color.hex);
        break;
      case 'globeMulti':
        this.props.ChangeGlobeMultiColor(filterSetting, color.hex);
        break;
      case 'panel':
        let newPannelBack = `rgba(${color.rgb.r}, ${color.rgb.g}, ${
          color.rgb.b
        }, 0.7)`;
        this.props.ChangePanelColor(newPannelBack);
        break;
      default:
        break;
    }
  }

  colorPresetter() {
    this.props.settings.customStyling[this.props.selectedColorProp];
    switch (this.props.selectedColorProp) {
      case 'MC1':
        return this.props.settings.customStyling.MC1;
        break;
      case 'MC2':
        return this.props.settings.customStyling.MC2;
        break;
      case 'MC3':
        return this.props.settings.customStyling.MC3;
        break;
      case 'MC4':
        return this.props.settings.customStyling.MC4;
        break;
      case 'MC5':
        return this.props.settings.customStyling.MC5;
        break;
      case 'NXSlogo':
        return this.props.NXSlogoRGB;
        break;
      case 'iconMenu':
        return this.props.iconMenuRGB;
        break;
      case 'footer':
        return this.props.footerRGB;
        break;
      case 'footerHover':
        return this.props.footerHoverRGB;
        break;
      case 'footerActive':
        return this.props.footerActiveRGB;
        break;
      case 'globePillar':
        return this.props.settings.customStyling.globePillarColorRGB;
        break;
      case 'globeArch':
        return this.props.settings.customStyling.globeArchColorRGB;
        break;
      case 'globeMulti':
        return this.props.settings.customStyling.globeMultiColorRGB;
        break;
      case 'panel':
        return this.props.settings.customStyling.pannelBack;
        break;
      default:
        break;
    }
  }

  updateRenderGlobe() {
    let settings = GetSettings();
    settings.renderGlobe = !this.props.settings.renderGlobe;
    SaveSettings(settings);
  }

  SaveSettings() {
    SaveSettings(this.props.settings);
    this.context.showNotification(
      <FormattedMessage
        id="Alert.StyleSettingsSaved"
        defaultMessage="Style Settings Saved"
      />,
      'success'
    );

    googleanalytics.SendEvent('Settings', 'Style', 'Saved', 1);
  }

  setColor = (key, value) => {
    this.props.CustomizeStyling({
      ...this.props.settings.customStyling,
      [key]: value,
    });
  };

  // Mandatory React method
  render() {
    const {
      theme,
      settings,
      webGLEnabled,
      ToggleGlobeRender,
      CustomizeStyling,
      ResetStyle,
    } = this.props;

    return (
      <StyleSettings>
        <form>
          <SettingsField
            connectLabel
            label={
              <FormattedMessage
                id="Settings.RenderGlobe"
                defaultMessage="Render Globe"
              />
            }
            subLabel={
              <div>
                <FormattedMessage
                  id="ToolTip.RenderGlobe"
                  defaultMessage="Render the globe on the Overview page"
                />
                {!webGLEnabled && (
                  <div className="error">
                    <FormattedMessage
                      id="ToolTip.RenderGlobeOpenGLFail"
                      defaultMessage="Your Computer does not support OPENGL 2.0"
                    />
                  </div>
                )}
              </div>
            }
          >
            <Switch
              disabled={!webGLEnabled}
              checked={settings.renderGlobe}
              onChange={() => {
                ToggleGlobeRender();
                this.updateRenderGlobe();
              }}
            />
          </SettingsField>

          <SettingsField label="Color scheme">
            <Button onClick={this.props.ResetStyle}>Reset to default</Button>
          </SettingsField>

          <SettingsField indent={1} label="Background color">
            <ColorPicker colorName="dark" onChange={this.setColor} />
          </SettingsField>
          <SettingsField indent={1} label="Foreground color">
            <ColorPicker colorName="light" onChange={this.setColor} />
          </SettingsField>
          <SettingsField indent={1} label="Primary color">
            <ColorPicker colorName="primary" onChange={this.setColor} />
          </SettingsField>
          <SettingsField indent={1} label="Primary contrast color">
            <ColorPicker colorName="primaryContrast" onChange={this.setColor} />
          </SettingsField>
          <SettingsField indent={1} label="Error color">
            <ColorPicker colorName="error" onChange={this.setColor} />
          </SettingsField>
          <SettingsField indent={1} label="Error contrast color">
            <ColorPicker colorName="errorContrast" onChange={this.setColor} />
          </SettingsField>

          <div className="flex space-between" style={{ marginTop: '2em' }}>
            <div />
            <Button
              skin="primary"
              onClick={e => {
                e.preventDefault();
                this.SaveSettings();
              }}
            >
              <FormattedMessage
                id="Settings.SaveSettings"
                defaultMessage="Save Settings"
              />
            </Button>
          </div>
        </form>
      </StyleSettings>
    );
  }
}

// Mandatory React-Redux method
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SettingsStyle);
