import React, { Component } from "react";
import { Link } from "react-router-dom";
import styles from "./style.css";

export default class SettingsCore extends Component {

  //
  // componentDidMount - Initialize the settings
  //

  componentDidMount() {

    var settings = require("../../api/settings.js").GetSettings();

    //Core settings
    this.setManualDaemon(settings);
    this.setManualDaemonUser(settings);
    this.setManualDaemonPassword(settings);
    this.setManualDaemonIP(settings);
    this.setManualDaemonPort(settings);
    this.setMapPortUsingUpnp(settings);
    this.setSocks4Proxy(settings);
    this.setSocks4ProxyIP(settings);
    this.setSocks4ProxyPort(settings);
    this.setDetatchDatabaseOnShutdown(settings);
    this.setOptionalTransactionFee(settings);

  }

  //
  // Set manual daemon mode
  //

  setManualDaemon(settings) {

    var manualDaemon = document.getElementById("manualDaemon");
    var manualDaemonSettings = document.getElementById("manual-daemon-settings");
    var automaticDaemonSettings = document.getElementById("automatic-daemon-settings");

    if (settings.manualDaemon == true) {
      manualDaemon.checked = true;
    }

    if (manualDaemon.checked) {
      manualDaemonSettings.style.display="block";
      automaticDaemonSettings.style.display="none";
    }
    else {
      manualDaemonSettings.style.display="none";
      automaticDaemonSettings.style.display="block";
    }
  }

  //
  // Set manual daemon username
  //

  setManualDaemonUser(settings) {

    var manualDaemonUser = document.getElementById("manualDaemonUser");

    if ( settings.manualDaemonUser === undefined)
    {
      manualDaemonUser.value = "rpcserver";
    }
    else
    {
      manualDaemonUser.value = settings.manualDaemonUser;
    }
  }

  //
  // Set manual daemon password
  //

  setManualDaemonPassword(settings) {

    var manualDaemonPassword = document.getElementById("manualDaemonPassword");

    if ( settings.manualDaemonPassword === undefined)
    {
      manualDaemonPassword.value = "password";
    }
    else
    {
      manualDaemonPassword.value = settings.manualDaemonPassword;
    }
  }

  //
  // Set manual daemon ip address
  //

  setManualDaemonIP(settings) {

    var manualDaemonIP = document.getElementById("manualDaemonIP");

    if ( settings.manualDaemonIP === undefined)
    {
      manualDaemonIP.value = "127.0.0.1";
    }
    else
    {
      manualDaemonIP.value = settings.manualDaemonIP;
    }
  }

  //
  // Set manual daemon port
  //

  setManualDaemonPort(settings) {

    var manualDaemonPort = document.getElementById("manualDaemonPort");

    if ( settings.manualDaemonPort === undefined)
    {
      manualDaemonPort.value = "9336";
    }
    else
    {
      manualDaemonPort.value = settings.manualDaemonPort;
    }
  }

  //
  // Set map port using UPnP
  //

  setMapPortUsingUpnp(settings) {

    var mapPortUsingUpnp = document.getElementById("mapPortUsingUpnp");

    if ( settings.mapPortUsingUpnp === undefined)
    {
      mapPortUsingUpnp.checked = true;
    }
    if ( settings.mapPortUsingUpnp == true)
    {
      mapPortUsingUpnp.checked = true;
    }
    if ( settings.mapPortUsingUpnp == false)
    {
      mapPortUsingUpnp.checked = false;
    }
  }

  //
  // Set SOCKS4 proxy
  //

  setSocks4Proxy(settings) {

    var socks4Proxy = document.getElementById("socks4Proxy");
    var socks4ProxyIP = document.getElementById("socks4ProxyIP");
    var socks4ProxyPort = document.getElementById("socks4ProxyPort");

    if ( settings.socks4Proxy === undefined)
    {
      socks4Proxy.checked = false;
    }
    if ( settings.socks4Proxy == true)
    {
      socks4Proxy.checked = true;
    }
    if ( settings.socks4Proxy == false)
    {
      socks4Proxy.checked = false;
    }

    if (!socks4Proxy.checked) 
    {
      socks4ProxyIP.disabled = true;
      socks4ProxyPort.disabled = true;
    }
  }

  //
  // Set SOCKS4 proxy IP address
  //

  setSocks4ProxyIP(settings) {

    var socks4ProxyIP = document.getElementById("socks4ProxyIP");

    if ( settings.socks4ProxyIP === undefined)
    {
      socks4ProxyIP.value = "127.0.0.1";
    }
    else
    {
      socks4ProxyIP.value = settings.socks4ProxyIP;
    }
  }

  //
  // Set SOCKS4 proxy port
  //

  setSocks4ProxyPort(settings) {

    var socks4ProxyPort = document.getElementById("socks4ProxyPort");

    if ( settings.socks4ProxyPort === undefined)
    {
      socks4ProxyPort.value = "9050";
    }
    else
    {
      socks4ProxyPort.value = settings.socks4ProxyPort;
    }
  }

  //
  // Set detach database on shutdown
  //

  setDetatchDatabaseOnShutdown(settings) {

    var detatchDatabaseOnShutdown = document.getElementById("detatchDatabaseOnShutdown");

    if ( settings.detatchDatabaseOnShutdown === undefined)
    {
      detatchDatabaseOnShutdown.checked = false;
    }
    if ( settings.detatchDatabaseOnShutdown == true)
    {
      detatchDatabaseOnShutdown.checked = true;
    }
    if ( settings.detatchDatabaseOnShutdown == false)
    {
      detatchDatabaseOnShutdown.checked = false;
    }
  }

  //
  // Set optional transaction fee
  //

  setOptionalTransactionFee(settings) {

    var optionalTransactionFee = document.getElementById("optionalTransactionFee");

    if ( settings.optionalTransactionFee === undefined)
    {
      optionalTransactionFee.value = "0.01";
    }
    else
    {
      optionalTransactionFee.value = settings.optionalTransactionFee;
    }
  }

  //
  // Update manual daemon mode
  //

  updateManualDaemon(event) {

    var el = event.target;
    var settings = require("../../api/settings.js");
    var settingsObj = settings.GetSettings();

    settingsObj.manualDaemon = el.checked;
    
    settings.SaveSettings(settingsObj);

    var manualDaemonSettings = document.getElementById("manual-daemon-settings");
    var automaticDaemonSettings = document.getElementById("automatic-daemon-settings");

    if (el.checked) {
      manualDaemonSettings.style.display="block";
      automaticDaemonSettings.style.display="none";
    }
    else {
      manualDaemonSettings.style.display="none";
      automaticDaemonSettings.style.display="block";
    }
  }

  //
  // Update manual daemon mode user
  //

  updateManualDaemonUser(event) {

    var el = event.target;
    var settings = require("../../api/settings.js");
    var settingsObj = settings.GetSettings();

    settingsObj.manualDaemonUser = el.value;
    
    settings.SaveSettings(settingsObj);
  }

  //
  // Update manual daemon mode password
  //

  updateManualDaemonPassword(event) {

    var el = event.target;
    var settings = require("../../api/settings.js");
    var settingsObj = settings.GetSettings();

    settingsObj.manualDaemonPassword = el.value;
    
    settings.SaveSettings(settingsObj);
  }

  //
  // Update manual daemon ip address
  //

  updateManualDaemonIP(event) {

    var el = event.target;
    var settings = require("../../api/settings.js");
    var settingsObj = settings.GetSettings();

    settingsObj.manualDaemonIP = el.value;
    
    settings.SaveSettings(settingsObj);
  }

  //
  // Update manual daemon port
  //

  updateManualDaemonPort(event) {

    var el = event.target;
    var settings = require("../../api/settings.js");
    var settingsObj = settings.GetSettings();

    settingsObj.manualDaemonPort = el.value;
    
    settings.SaveSettings(settingsObj);
  }

  //
  // Update map port using UPnP
  //

  updateMapPortUsingUpnp(event) {

    var el = event.target;
    var settings = require("../../api/settings.js");
    var settingsObj = settings.GetSettings();

    settingsObj.mapPortUsingUpnp = el.checked;

    settings.SaveSettings(settingsObj);
  }

  //
  // Update SOCKS4 proxy
  //

  updateSocks4Proxy(event) {

    var el = event.target;
    var settings = require("../../api/settings.js");
    var settingsObj = settings.GetSettings();

    settingsObj.socks4Proxy = el.checked;

    settings.SaveSettings(settingsObj);

    var socks4ProxyIP = document.getElementById("socks4ProxyIP");
    var socks4ProxyPort = document.getElementById("socks4ProxyPort");

    if (el.checked) {
      socks4ProxyIP.disabled = false;
      socks4ProxyPort.disabled = false;
    }
    else {
      socks4ProxyIP.disabled = true;
      socks4ProxyPort.disabled = true;
    }
  }

  //
  // Update SOCKS4 proxy IP address
  //

  updateSocks4ProxyIP(event) {

    var el = event.target;
    var settings = require("../../api/settings.js");
    var settingsObj = settings.GetSettings();

    settingsObj.socks4ProxyIP = el.value;

    settings.SaveSettings(settingsObj);
  }

  //
  // Update SOCKS4 proxy port
  //

  updateSocks4ProxyPort(event) {

    var el = event.target;
    var settings = require("../../api/settings.js");
    var settingsObj = settings.GetSettings();

    settingsObj.socks4ProxyPort = el.value;

    settings.SaveSettings(settingsObj);
  }

  //
  // Update detach database on shutdown
  //

  updateDetatchDatabaseOnShutdown(event) {

    var el = event.target;
    var settings = require("../../api/settings.js");
    var settingsObj = settings.GetSettings();
    settingsObj.detatchDatabaseOnShutdown = el.checked;

    settings.SaveSettings(settingsObj);
  }


  //
  // Update optional transaction fee
  //

  updateOptionalTransactionFee(event) {

    var el = event.target;
    var settings = require("../../api/settings.js");
    var settingsObj = settings.GetSettings();

    settingsObj.optionalTransactionFee = el.value;

    settings.SaveSettings(settingsObj);
  }

  //
  // Restart the core
  //

  coreRestart() {

    let core = require('electron').remote.getGlobal('core');
    core.restart();

  }
  
  render() {
    return (

      <section id="core">

        <div className="note">

          Changes to core settings will take effect the next time the core is restarted.

        </div>

        <form className="aligned">

          <div className="field">
            <label htmlFor="manualDaemon">Manual Daemon Mode</label>
            <input id="manualDaemon" type="checkbox" className="switch" onChange={this.updateManualDaemon} data-tooltip="Enable manual daemon mode if you are running the daemon manually outside of the wallet"/>
          </div>

          <div id="manual-daemon-settings">

            <div className="field">
              <label htmlFor="manualDaemonUser" >Username</label>
              <input id="manualDaemonUser" type="text" size="12" onChange={this.updateManualDaemonUser} data-tooltip="Username configured for manual daemon"/>
            </div>

            <div className="field">
              <label htmlFor="manualDaemonPassword" >Password</label>
              <input id="manualDaemonPassword" type="text" size="12" onChange={this.updateManualDaemonPassword} data-tooltip="Password configured for manual daemon"/>
            </div>

            <div className="field">
              <label htmlFor="manualDaemonIP" >IP Address</label>
              <input id="manualDaemonIP" type="text" size="12" onChange={this.updateManualDaemonIP} data-tooltip="IP address configured for manual daemon"/>
            </div>

            <div className="field">
              <label htmlFor="manualDaemonPort">Port</label>
              <input id="manualDaemonPort" type="text" size="3" onChange={this.updateManualDaemonPort} data-tooltip="Port configured for manual daemon"/>
            </div>
          
          </div>

          <div id="automatic-daemon-settings">

            <div className="field">
              <label htmlFor="mapPortUsingUpnp">Map port using UPnP</label>
              <input id="mapPortUsingUpnp" type="checkbox" className="switch" onChange={this.updateMapPortUsingUpnp} data-tooltip="Automatically open the Nexus client port on the router. This only works when your router supports UPnP and it is enabled."/>
            </div>

            <div className="field">
              <label htmlFor="socks4Proxy">Connect through SOCKS4 proxy</label>
              <input id="socks4Proxy" type="checkbox" className="switch" onChange={this.updateSocks4Proxy} data-tooltip="Connect to Nexus through a SOCKS4 proxy (e.g. when connecting through Tor)"/>
            </div>

            <div className="field">
              <label htmlFor="socks4ProxyIP">Proxy IP Address</label>
              <input id="socks4ProxyIP" type="text" size="12" onChange={this.updateSocks4ProxyIP} data-tooltip="IP Address of SOCKS4 proxy server"/>
            </div>

            <div className="field">
              <label htmlFor="socks4ProxyPort">Proxy Port</label>
              <input id="socks4ProxyPort" type="text" size="3" onChange={this.updateSocks4ProxyPort} data-tooltip="Port of SOCKS4 proxy server"/>
            </div>

            <div className="field">
              <label htmlFor="detatchDatabaseOnShutdown">Detach database on shutdown</label>
              <input id="detatchDatabaseOnShutdown" type="checkbox" className="switch" onChange={this.updateDetatchDatabaseOnShutdown} data-tooltip="Detach the database when shutting down the wallet"/>
            </div>

            <div className="field">
              <label htmlFor="optionalTransactionFee">Optional transaction fee (in NXS)</label>
              <input id="optionalTransactionFee" type="text" size="6" onChange={this.updateOptionalTransactionFee} data-tooltip="Optional transaction fee to include on transactions. Higher amounts will allow transactions to be processed faster, lower may cause additional transaction processing"/>
            </div>

            <button id="restart-core" className="button primary" onClick={this.coreRestart}>Restart Core</button>

          </div>

          <div className="clear-both"></div>

        </form>

      {/* <button className="button primary" onClick={application.restart()}>Restart Core</button> */}


      </section>

    );
  }
}
