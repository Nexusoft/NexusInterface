// External
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { remote } from 'electron';
import fs from 'fs';
import styled from '@emotion/styled';

// Internal
import { updateSettings } from 'actions/settingsActionCreators';
import { updateTheme, resetColors } from 'actions/themeActionCreators';
import Text, { translate } from 'components/Text';
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

const mapStateToProps = ({
  settings: { renderGlobe, locale },
  overview: { webGLEnabled },
  theme,
}) => {
  return {
    renderGlobe,
    webGLEnabled,
    theme,
    locale,
  };
};
const mapDispatchToProps = dispatch => ({
  setRenderGlobe: renderGlobe => dispatch(updateSettings({ renderGlobe })),
  updateTheme: updates => dispatch(updateTheme(updates)),
  resetColors: () => dispatch(resetColors()),
});

@connect(
  mapStateToProps,
  mapDispatchToProps
)
export default class SettingsStyle extends Component {
  toggleGlobeRender = e => {
    this.props.setRenderGlobe(e.target.checked);
  };

  setWalpaper = path => {
    this.props.updateTheme({ wallpaper: path });
  };

  setColor = (key, value) => {
    this.props.updateTheme({
      [key]: value,
    });
  };

  resetColors = () => {
    this.props.resetColors();
    UIController.showNotification(
      <Text id="Settings.ResetThemeNoti" />,
      'success'
    );
  };

  loadCustomTheme = filepath => {
    const content = fs.readFileSync(filepath);
    let customTheme;
    try {
      customTheme = JSON.parse(content);
    } catch (err) {
      UIController.showNotification(
        <Text id="Settings.Errors.InvalidJSON" />,
        'error'
      );
    }
    this.props.updateTheme(customTheme);
  };

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

  render() {
    const { theme, renderGlobe, webGLEnabled } = this.props;

    return (
      <StyleSettings>
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
          label={<Text id="Settings.Background" />}
          subLabel={<Text id="Settings.BackgroundSubLabel" />}
        >
          <BackgroundPicker
            wallpaper={theme.wallpaper}
            onChange={this.setWalpaper}
          />
        </SettingsField>

        <SettingsField label={<Text id="Settings.ColorScheme" />}>
          <Button skin="hyperlink" onClick={this.resetColors}>
            <Text id="Settings.ResetStyle" />
          </Button>
        </SettingsField>

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
        <SettingsField indent={1} label={<Text id="Cp.GPC" />}>
          <ColorPicker colorName="globePillarColor" onChange={this.setColor} />
        </SettingsField>
        <SettingsField indent={1} label={<Text id="Cp.GAC" />}>
          <ColorPicker colorName="globeArchColor" onChange={this.setColor} />
        </SettingsField>

        <div style={{ marginTop: '2em' }}>
          <Button onClick={this.openPickThemeFileDialog}>
            <Text id="Settings.PickThemeFile" />
          </Button>
        </div>
      </StyleSettings>
    );
  }
}
