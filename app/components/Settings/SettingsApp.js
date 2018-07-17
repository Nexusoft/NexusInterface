import React, { Component } from "react";
import { Link } from "react-router-dom";
import styles from "./style.css";

export default class SettingsApp extends Component {

  //
  // componentDidMount - Initialize the settings
  //

  componentDidMount() {

    var settings = require("../../api/settings.js").GetSettings();

    //Application settings
    this.setAutostart(settings);
    this.setMinimizeToTray(settings);
    this.setMinimizeOnClose(settings);
    this.setGoogleAnalytics(settings);
    this.setDefaultUnitAmount(settings);
    this.setDeveloperMode(settings);

  }

  //
  // Set autostart
  //

  setAutostart(settings) {

    var autostart = document.getElementById("autostart");

    if ( settings.autostart === undefined)
    {
      autostart.checked = false;
    }
    if ( settings.autostart === "true")
    {
      autostart.checked = true;
    }
    if ( settings.autostart === "false")
    {
      autostart.checked = false;
    }
  }

  //
  // Set minimize to tray
  //

  setMinimizeToTray(settings) {

    var minimizeToTray = document.getElementById("minimizeToTray");

    if ( settings.minimizeToTray === undefined)
    {
      minimizeToTray.checked = false;
    }
    if ( settings.minimizeToTray === "true")
    {
      minimizeToTray.checked = true;
    }
    if ( settings.minimizeToTray === "false")
    {
      minimizeToTray.checked = false;
    }
  }

  //
  // Set minimize on close
  //

  setMinimizeOnClose(settings) {

    var minimizeOnClose = document.getElementById("minimizeOnClose");

    if ( settings.minimizeOnClose === undefined)
    {
      minimizeOnClose.checked = false;
    }
    if ( settings.minimizeOnClose === "true")
    {
      minimizeOnClose.checked = true;
    }
    if ( settings.minimizeOnClose === "false")
    {
      minimizeOnClose.checked = false;
    }
  }

  //
  // Set Google Analytics Enabled
  //

  setGoogleAnalytics(settings){

    var googlesetting = document.getElementById("googleAnalytics");

    if ( settings.googleAnalytics === undefined)
    {
      googlesetting.checked = true;
    }
    if (settings.googleAnalytics === "true")
    {
      googlesetting.checked = true;
    }
    if ( settings.googleAnalytics === "false"){
      googlesetting.checked = false;
    }
  }

  //
  // Set default unit amount
  //

  setDefaultUnitAmount(settings){

    var defaultUnitAmount = document.getElementById("defaultUnitAmount");

    if ( settings.defaultUnitAmount === undefined)
    {
      defaultUnitAmount.value = "NXS";
    }
    else
    {
      defaultUnitAmount.value = settings.defaultUnitAmount;
    }
  }

  //
  // Set developer mode
  //

  setDeveloperMode(settings) {

    var devmode = document.getElementById("devmode");

    if (settings.devMode === "true") {
      devmode.checked = true;
    }
  }

  //
  // Update autostart
  //

  updateAutoStart(event)
  {
    var el = event.target;
    var settings = require("../../api/settings.js");
    var settingsObj = settings.GetSettings();

    settingsObj.autostart = el.checked.toString();

    settings.SaveSettings(settingsObj);


    ///This is the code that will create a reg to have the OS auto start the app
    var AutoLaunch = require('auto-launch');
    /// Change Name when we need to
    var autolaunchsettings = new AutoLaunch({
      name: 'nexus-interface'
    });
    ///No need for a path as it will be set automaticly

    
    ///Check selector
    if (el.checked.toString() == "true")
    {
      autolaunchsettings.enable();
      autolaunchsettings.isEnabled()
      .then(function(isEnabled){
        if(isEnabled){
          return;
        }
        autolaunchsettings.enable();
      })
      .catch(function(err){
        // handle error
      });
    }
    else
    {
      /// Will Remove the property that makes it auto play
      autolaunchsettings.disable();
    }
  }

  //
  // Update minimize to tray
  //

  updateMinimizeToTray(event)
  {
    var el = event.target;
    var settings = require("../../api/settings.js");
    var settingsObj = settings.GetSettings();

    settingsObj.minimizeToTray = el.checked.toString();

    settings.SaveSettings(settingsObj);
  }

  //
  // Update minimize on close
  //

  updateMinimizeOnClose(event)
  {
    var el = event.target;
    var settings = require("../../api/settings.js");
    var settingsObj = settings.GetSettings();

    settingsObj.minimizeOnClose = el.checked.toString();

    settings.SaveSettings(settingsObj);
  }

  //
  // Update enabled google analytics
  //

  updateGoogleAnalytics(event)
  {
    var el = event.target;
    var settings = require("../../api/settings.js");
    var settingsObj = settings.GetSettings();

    settingsObj.googleAnalytics = el.checked.toString();

    settings.SaveSettings(settingsObj);

    // SETTINGS.Analytics.GANALYTICS.SetEnabled(settingsObj.googleAnalytics);
  }

  //
  // Update default unit amount
  //

  updateDefaultUnitAmount(event)
  {
    var el = event.target;
    var settings = require("../../api/settings.js");
    var settingsObj = settings.GetSettings();

    settingsObj.defaultUnitAmount = el.options[el.selectedIndex].value;

    settings.SaveSettings(settingsObj);
  }

  //
  // Update developer mode
  //

  updateDeveloperMode(event) {

    var el = event.target;
    var settings = require("../../api/settings.js");
    var settingsObj = settings.GetSettings();

    settingsObj.devMode = el.checked.toString();
    
    settings.SaveSettings(settingsObj);
  }

  render() {
    return (
      <section id="application">

        <form className="aligned">

          <div className="field">
            <label htmlFor="autostart">Start at system startup</label>
            <input id="autostart" type="checkbox" className="switch" onChange={this.updateAutoStart} data-tooltip="Automatically start the wallet when you log into your system"/>
          </div>

          <div className="field">
            <label htmlFor="minimizeToTray">Minimize to tray</label>
            <input id="minimizeToTray" type="checkbox" className="switch" onChange={this.updateMinimizeToTray} data-tooltip="Minimize the wallet to the system tray"/>
          </div>

          <div className="field">
            <label htmlFor="minimizeOnClose">Minimize on close</label>
            <input id="minimizeOnClose" type="checkbox" className="switch" onChange={this.updateMinimizeOnClose} data-tooltip="Minimize the wallet when closing the window instead of closing it"/>
          </div>

          <div className="field">
            <label htmlFor="googleAnalytics">Send anonymous usage data</label>
            <input id="googleAnalytics" type="checkbox" className="switch" onChange={this.updateGoogleAnalytics} data-tooltip="Send anonymous usage data to allow the Nexus developers to improve the wallet"/>
          </div>

          <div className="field">
            <label htmlFor="defaultUnitAmount">Default unit amount</label>
            <select id="defaultUnitAmount" onChange={this.updateDefaultUnitAmount} data-tooltip="Default unit amount to display throughout the wallet">
              <option value="NXS">NXS</option>
              <option value="mNXS">mNXS</option>
              <option value="uNXS">uNXS</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="devmode">Developer Mode</label>
            <input id="devmode" type="checkbox" className="switch" onChange={this.updateDeveloperMode} data-tooltip="Development mode enables advanced features to aid in development. After enabling the wallet must be closed and reopened to enable those features"/>
          </div>

          <div className="clear-both"></div>

        </form>

      </section>
    );
  }
}
