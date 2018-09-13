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
  styleTest: () => dispatch({ type: TYPE.CHANGE_COLOR_1 })
});

class SettingsStyle extends Component {
  setRenderGlobe(settings) {
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
                >
                  <option>color1 </option>
                  <option>color2 </option>
                  <option>color3 </option>
                  <option>color4 </option>
                </select>
              </label>
              <ChromePicker />
            </div>
            <button className="button primary">Save Settings</button>
            <button
              className="button"
              onClick={e => {
                e.preventDefault();
                this.props.styleTest();
              }}
            >
              Reset Style Settings
            </button>
            <div className="clear-both" />
          </form>{" "}
        </section>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SettingsStyle);
