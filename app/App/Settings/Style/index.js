// External
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Text from 'components/Text';
import googleanalytics from 'scripts/googleanalytics';
import styled from '@emotion/styled';

// Internal
import * as TYPE from 'actions/actiontypes';
import { GetSettings, SaveSettings } from 'api/settings';
import SettingsField from 'components/SettingsField';
import Button from 'components/Button';
import Switch from 'components/Switch';
import UIController from 'components/UIController';
import ColorPicker from './ColorPicker';
import BackgroundPicker from './BackgroundPicker';

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
  SetWalpaper: path => dispatch({ type: TYPE.SET_WALLPAPER, payload: path }),
  CustomizeStyling: hex =>
    dispatch({ type: TYPE.CUSTOMIZE_STYLING, payload: hex }),
  ResetStyle: () => dispatch({ type: TYPE.RESET_CUSTOM_STYLING }),
  ToggleGlobeRender: () => dispatch({ type: TYPE.TOGGLE_GLOBE_RENDER }),
});

class SettingsStyle extends Component {
  SaveSettings() {
    SaveSettings(this.props.settings);
    UIController.showNotification(
      <Text id="Alert.StyleSettingsSaved" />,
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

  resetColors = () => {
    this.props.ResetStyle();
    UIController.showNotification(
      'Color scheme has been reset to default',
      'success'
    );
  };

  // Mandatory React method
  render() {
    const {
      settings,
      webGLEnabled,
      ToggleGlobeRender,
      SetWalpaper,
    } = this.props;

    return (
      <StyleSettings>
        <form>
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
              checked={settings.renderGlobe}
              onChange={ToggleGlobeRender}
            />
          </SettingsField>

          <SettingsField
            label="Background"
            subLabel="Customize your background wallpaper"
          >
            <BackgroundPicker
              wallpaper={settings.wallpaper}
              onChange={SetWalpaper}
            />
          </SettingsField>

          <SettingsField label="Color scheme">
            <Button skin="hyperlink" onClick={this.resetColors}>
              <Text id="Settings.ResetStyle" />
            </Button>
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
              <Text id="Settings.SaveSettings" />
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
