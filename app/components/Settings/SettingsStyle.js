import React, { Component } from "react";
import { Link } from "react-router-dom";
import styles from "./style.css";

export default class SettingsStyle extends Component {
  //
  // componentDidMount - Initialize the settings
  //

  componentDidMount() {
    var settings = require("../../api/settings.js").GetSettings();

    //Application settings
    this.setWallpaper(settings);
  }

  //
  // Set Google Analytics Enabled
  //

  setGoogleAnalytics(settings) {
    var googlesetting = document.getElementById("googleAnalytics");

    if (settings.googleAnalytics === undefined) {
      googlesetting.checked = true;
    }
    if (settings.googleAnalytics == true) {
      googlesetting.checked = true;
    }
    if (settings.googleAnalytics == false) {
      googlesetting.checked = false;
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
    //console.log(imagePath);
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

  render() {
    return (
      <section id="application">
        <form className="aligned">
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

          <div className="clear-both" />
        </form>
      </section>
    );
  }
}
