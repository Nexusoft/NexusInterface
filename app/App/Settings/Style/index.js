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

import fs from 'fs';

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
    SaveSettings({...this.props.settings, theme: this.props.theme});
    UIController.showNotification(
      <Text id="Alert.StyleSettingsSaved" />,
      'success'
    );

    googleanalytics.SendEvent('Settings', 'Style', 'Saved', 1);
  }

  setColor = (key, value) => {
    this.props.CustomizeStyling({
      ...this.props.theme,
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

  setCustomSettingsFile = (filepath) => {
    console.log(filepath);
    const fileOBJ = fs.readFileSync(filepath);
    const jsonOBJ = JSON.parse(fileOBJ);

    this.props.CustomizeStyling({
      ...jsonOBJ
    });
    setTimeout(() => {
        this.SaveSettings();
    }, 1000);
  }


  // Mandatory React method
  render() {
    const {
      theme,
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
            label="Settings File"
            subLabel="Import Custom Settings File"
            
          ><Button
          skin="primary"
          htmlFor="chooseCustomSettingsFile"
          for="chooseCustomSettingsFile"
          onClick = {() => {document.getElementById("chooseCustomSettingsFile").click(); }}
        ><Text id="Settings.PickThemeFile"/>
       </Button>
            <input
              id="chooseCustomSettingsFile"
              type="file"
              accept=".json"
              style={{display: 'none'}}
              onChange={e => {
                if (!!e.target.files.length) {
                  let customFilePath = e.target.files[0].path;
                  if (process.platform === 'win32') {
                    customFilePath = customFilePath.replace(/\\/g, '/');
                  }
                  this.setCustomSettingsFile(customFilePath);
                  e.target.value = "";
                }
              }}
            /> 
          </SettingsField>

          <SettingsField
            label="Background"
            subLabel="Customize your background wallpaper"
          >
            <BackgroundPicker
              wallpaper={theme.wallpaper}
              onChange={SetWalpaper}
            />
          </SettingsField>

          <SettingsField label="Color scheme">
            <Button skin="hyperlink" onClick={this.resetColors}>
              <Text id="Settings.ResetStyle" />
            </Button>
          </SettingsField>

          <SettingsField indent={1} label={<Text id="Cp.PBC"/>}>
            <ColorPicker colorName="dark" onChange={this.setColor} />
          </SettingsField>
          <SettingsField indent={1} label={<Text id="Cp.TC"/>}>
            <ColorPicker colorName="light" onChange={this.setColor} />
          </SettingsField>
          <SettingsField indent={1} label={<Text id="Cp.PC"/>}>
            <ColorPicker colorName="primary" onChange={this.setColor} />
          </SettingsField>
          <SettingsField indent={1} label={<Text id="Cp.PCA"/>}>
            <ColorPicker colorName="primaryContrast" onChange={this.setColor} />
          </SettingsField>
          <SettingsField indent={1} label={<Text id="Cp.ER"/>}>
            <ColorPicker colorName="error" onChange={this.setColor} />
          </SettingsField>
          <SettingsField indent={1} label={<Text id="Cp.ERA"/>}>
            <ColorPicker colorName="errorContrast" onChange={this.setColor} />
          </SettingsField>
          <SettingsField indent={1} label={<Text id="Cp.GC"/>}>
            <ColorPicker colorName="globeColor" onChange={this.setColor} />
          </SettingsField>
          <SettingsField indent={2} label={<Text id="Cp.GPC"/>}>
            <ColorPicker colorName="globePillarColor" onChange={this.setColor} />
          </SettingsField>
          <SettingsField indent={2} label={<Text id="Cp.GAC"/>}>
            <ColorPicker colorName="globeArchColor" onChange={this.setColor} />
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
