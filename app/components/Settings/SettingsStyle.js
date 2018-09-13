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
    this.setRenderGlobe(settings);
  }
  
  /// Set Wallpaper
  /// Sets the wallpaper value
  setWallpaper(settings) {
     var wallpaper = document.getElementById("wallpaper");

     if (settings.wallpaper === undefined) {
     //  wallpaper.value = "../images/background/Wallet-Design-Blue-AquaStars2-BG.png";
     } else {
      // wallpaper.value = settings.wallpaper;
     }

   }

  /// Set Render Globe
  /// Set whether or not that the application will render out the globe on the overview page.  
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
  updateRenderGlobe(event)
  {
    let settings = require("../../api/settings.js").GetSettings();
    settings.renderGlobe = event.target.checked;
    require("../../api/settings.js").SaveSettings(settings);
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

          <div className="clear-both" />
        </form>
      </section>
    );
  }
}
