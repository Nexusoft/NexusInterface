import React, { Component } from "react";
import { Link } from "react-router-dom";
import styles from "./style.css";

import CustomProperties from 'react-custom-properties';

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
    
    console.log(el.files[0].path);
    settingsObj.wallpaper = el.files[0].path;

    settings.SaveSettings(settingsObj);

    document.body.style.setProperty('--background-main-image', "url('" + el.files[0].path + "')");
  }


  render() {
    return (
      <section id="application">
        <form className="aligned">

            <div className="field">
                <label htmlFor="wallpaper">Wallpaper</label>
                <input id="wallpaper" type="file" size="25" onChange={this.updateWallpaper} data-tooltip="The background wallpaper for your wallet"/>
            </div>

          <div className="clear-both" />
        </form>
      </section>
    );
  }
}