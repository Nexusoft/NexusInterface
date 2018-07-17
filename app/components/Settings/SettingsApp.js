import React, { Component } from "react";
import { Link } from "react-router-dom";
import styles from "./style.css";

export default class SettingsApp extends Component {
  render() {
    return (
      <section id="application">

        <form className="aligned">

          <div className="field">
            <label htmlFor="autostart">Start at system startup</label>
            <input id="autostart" type="checkbox" className="switch" onChange="updateAutoStart(this)" data-tooltip="Automatically start the wallet when you log into your system"/>
          </div>

          <div className="field">
            <label htmlFor="minimizeToTray">Minimize to tray</label>
            <input id="minimizeToTray" type="checkbox" className="switch" onChange="updateMinimizeToTray(this)" data-tooltip="Minimize the wallet to the system tray"/>
          </div>

          <div className="field">
            <label htmlFor="minimizeOnClose">Minimize on close</label>
            <input id="minimizeOnClose" type="checkbox" className="switch" onChange="updateMinimizeOnClose(this)" data-tooltip="Minimize the wallet when closing the window instead of closing it"/>
          </div>

          <div className="field">
            <label htmlFor="googleAnalytics">Send anonymous usage data</label>
            <input id="googleAnalytics" type="checkbox" className="switch" onChange="updateGoogleAnalytics(this)" data-tooltip="Send anonymous usage data to allow the Nexus developers to improve the wallet"/>
          </div>

          <div className="field">
            <label htmlFor="defaultUnitAmount">Default unit amount</label>
            <select id="defaultUnitAmount" onChange="updateDefaultUnitAmount(this)" data-tooltip="Default unit amount to display throughout the wallet">
              <option value="NXS">NXS</option>
              <option value="mNXS">mNXS</option>
              <option value="uNXS">uNXS</option>
            </select>
          </div>
          
          <div className="clear-both"></div>

        </form>

      </section>
    );
  }
}
