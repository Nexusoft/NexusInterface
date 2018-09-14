import React, { Component } from "react";
import { Link } from "react-router-dom";
import styles from "./style.css";
import { connect } from "react-redux";
import { ChromePicker } from "react-color";

import * as TYPE from "../../actions/actiontypes";

const mapStateToProps = state => {
  return {
    ...state.common,
    ...state.settings
  };
};
const mapDispatchToProps = dispatch => ({
  setSettings: settings =>
    dispatch({ type: TYPE.GET_SETTINGS, payload: settings }),
  OpenModal: type => {
    dispatch({ type: TYPE.SHOW_MODAL, payload: type });
  },
  CloseModal: () => dispatch({ type: TYPE.HIDE_MODAL }),
  ChangeColor1: hex => dispatch({ type: TYPE.CHANGE_COLOR_1, payload: hex }),
  ChangeColor2: hex => dispatch({ type: TYPE.CHANGE_COLOR_2, payload: hex }),
  ChangeColor3: hex => dispatch({ type: TYPE.CHANGE_COLOR_3, payload: hex }),
  ChangeColor4: hex => dispatch({ type: TYPE.CHANGE_COLOR_4, payload: hex }),
  ChangeColor5: hex => dispatch({ type: TYPE.CHANGE_COLOR_5, payload: hex }),
  setSelectedColorProp: selected =>
    dispatch({ type: TYPE.SET_SELECTED_COLOR_PROP, payload: selected }),
  ChangeNexusLogoColor: (setting, hex) =>
    dispatch({
      type: TYPE.SET_NEXUS_LOGO_COLOR,
      payload: { setting: setting, hex: hex }
    }),
  ChangeIconMenuColor: (setting, hex) =>
    dispatch({
      type: TYPE.SET_ICON_MENU_COLOR,
      payload: { setting: setting, hex: hex }
    }),
  ChangeFooterColor: (setting, hex) =>
    dispatch({
      type: TYPE.SET_FOOTER_COLOR,
      payload: { setting: setting, hex: hex }
    }),
  ChangeFooterHoverColor: (setting, hex) =>
    dispatch({
      type: TYPE.SET_FOOTER_HOVER_COLOR,
      payload: { setting: setting, hex: hex }
    }),
  ChangeFooterActiveColor: (setting, hex) =>
    dispatch({
      type: TYPE.SET_FOOTER_ACTIVE_COLOR,
      payload: { setting: setting, hex: hex }
    }),
  ResetStyle: () => dispatch({ type: TYPE.RESET_CUSTOM_STYLING })
});

class SettingsStyle extends Component {
  setRenderGlobe() {
    let ifRenderGlobe = document.getElementById("renderGlobe");

    if (settings.renderGlobe == undefined) {
      ifRenderGlobe.checked = true;
    }
    if (settings.renderGlobe == true) {
      ifRenderGlobe.checked = true;
    }
    if (settings.renderGlobe == false) {
      ifRenderGlobe.checked = false;
    }
  }

  //
  // Update Wallpaper
  //

  updateWallpaper(event) {
    var el = event.target;
    var settings = require("../../api/settings.js");
    var settingsObj = settings.GetSettings();

    let imagePath = el.files[0].path;
    settingsObj.wallpaper = imagePath;
    settings.SaveSettings(settingsObj);

    if (process.platform === "win32") {
      imagePath = imagePath.replace(/\\/g, "/");
    }
    document.body.style.setProperty(
      "--background-main-image",
      'url("' + imagePath + '")'
    );
  }

  handleColorChange(color) {
    console.log(color);

    let H = color.hsl.h - 196.3;
    let S = 100 + (color.hsl.s * 100 - 100);
    let L = 100 + (color.hsl.l * 100 - 46.9);
    let filterSetting = `hue-rotate(${H}deg) brightness(${L}%) grayscale(0%) saturate(${S}%)`;

    switch (this.props.selectedColorProp) {
      case "MC1":
        this.props.ChangeColor1(color.hex);
        break;
      case "MC2":
        this.props.ChangeColor2(color.hex);
        break;
      case "MC3":
        this.props.ChangeColor3(color.hex);
        break;
      case "MC4":
        this.props.ChangeColor4(color.hex);
        break;
      case "MC5":
        this.props.ChangeColor5(color.hex);
        break;
      case "NXSlogo":
        this.props.ChangeNexusLogoColor(filterSetting, color.hex);
        break;
      case "iconMenu":
        this.props.ChangeIconMenuColor(filterSetting, color.hex);
        break;
      case "footer":
        this.props.ChangeFooterColor(filterSetting, color.hex);
        break;
      case "footerHover":
        this.props.ChangeFooterHoverColor(filterSetting, color.hex);
        break;
      case "footerActive":
        this.props.ChangeFooterActiveColor(filterSetting, color.hex);
        break;
      default:
        break;
    }
  }

  colorPresetter() {
    this.props.customStyling[this.props.selectedColorProp];
    switch (this.props.selectedColorProp) {
      case "MC1":
        return this.props.customStyling.MC1;
        break;
      case "MC2":
        return this.props.customStyling.MC2;
        break;
      case "MC3":
        return this.props.customStyling.MC3;
        break;
      case "MC4":
        return this.props.customStyling.MC4;
        break;
      case "MC5":
        return this.props.customStyling.MC5;
        break;
      case "NXSlogo":
        return this.props.NXSlogoRGB;
        break;
      case "iconMenu":
        return this.props.iconMenuRGB;
        break;
      case "footer":
        return this.props.footerRGB;
        break;
      case "footerHover":
        return this.props.footerHoverRGB;
        break;
      case "footerActive":
        return this.props.footerActiveRGB;
        break;
      default:
        break;
    }
  }

  /// Update Render Globe
  /// When you change the render settings update settings json
  updateRenderGlobe(event) {
    let settings = require("../../api/settings.js").GetSettings();
    settings.renderGlobe = event.target.checked;
    require("../../api/settings.js").SaveSettings(settings);
  }

  render() {
    return (
      <div>
        <section id="SettingsStyle">
          <form id="styleForm" className="aligned">
            <div className="field">
              <label htmlFor="wallpaper">Wallpaper</label>
              <input
                id="wallpaper"
                accept="image/*"
                type="file"
                size="25"
                onChange={this.updateWallpaper}
                data-tooltip="The background wallpaper for your wallet"
              />
            </div>
            <div className="field">
              <label htmlFor="renderGlobe">Render Globe</label>
              <input
                id="renderGlobe"
                type="checkbox"
                className="switch"
                onChange={this.updateRenderGlobe.bind(this)}
                data-tooltip="Render the globe on the overview page"
              />
            </div>
            <div className="field">
              <label>
                <select
                  style={{
                    maxWidth: "80%"
                  }}
                  id="select"
                  onChange={e => {
                    console.log("selector");
                    this.props.setSelectedColorProp(e.target.value);
                  }}
                >
                  <option value="MC1">color 1 </option>
                  <option value="MC2">color 2 </option>
                  <option value="MC3">color 3 </option>
                  <option value="MC4">color 4 </option>
                  <option value="MC5">color 5 </option>
                  <option value="NXSlogo">Nexus Logo Color</option>
                  <option value="iconMenu">Icon Color</option>
                  <option value="footer">Footer Base Color</option>
                  <option value="footerHover">Footer Hover Color</option>
                  <option value="footerActive">Footer Active Color</option>
                </select>
              </label>
              <ChromePicker
                color={this.colorPresetter()}
                disableAlpha={true}
                onChangeComplete={(color, event) => {
                  this.handleColorChange(color);
                }}
              />
            </div>
            <button className="button primary">Save Settings</button>
            <button
              className="button"
              onClick={e => {
                e.preventDefault();
                this.props.ResetStyle();
              }}
            >
              Reset Style Settings
            </button>
            <div className="clear-both" />
          </form>
        </section>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SettingsStyle);
