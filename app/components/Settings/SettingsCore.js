/*
  Title: 
  Description: 
  Last Modified by: Brian Smith
*/
// External Dependencies
import React, { Component } from "react";
import { Link } from "react-router-dom";
import { remote } from "electron";
import { access } from "fs";
import { connect } from "react-redux";
import Modal from "react-responsive-modal";

// Internal Dependencies
import styles from "./style.css";
import core from "../../api/core";
import * as TYPE from "../../actions/actiontypes";
import * as RPC from "../../script/rpc";
import ContextMenuBuilder from "../../contextmenu";

// React-Redux mandatory methods
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
  OpenModal2: type => {
    dispatch({ type: TYPE.SHOW_MODAL2, payload: type });
  },
  CloseModal2: type => {
    dispatch({ type: TYPE.HIDE_MODAL2, payload: type });
  }
});

class SettingsCore extends Component {
  // React Method (Life cycle hook)
  componentDidMount() {
    var settings = require("../../api/settings.js").GetSettings();

    //Core settings
    this.setManualDaemon(settings);
    this.setManualDaemonUser(settings);
    this.setManualDaemonPassword(settings);
    this.setManualDaemonIP(settings);
    this.setManualDaemonPort(settings);
    this.setManualDaemonDataDir(settings);
    this.setEnableMining(settings);
    this.setEnableStaking(settings);
    this.setMapPortUsingUpnp(settings);
    this.setSocks4Proxy(settings);
    this.setSocks4ProxyIP(settings);
    this.setSocks4ProxyPort(settings);
    this.setDetatchDatabaseOnShutdown(settings);
    // this.setOptionalTransactionFee(settings);
  }

  // Class Methods
  setEnableMining(settings) {
    var enableMining = document.getElementById("enableMining");

    if (settings.enableMining == true) {
      enableMining.checked = true;
    } else {
      enableMining.checked = false;
    }
  }

  setEnableStaking(settings) {
    var enableStaking = document.getElementById("enableStaking");

    if (settings.enableStaking == true) {
      enableStaking.checked = true;
    } else {
      enableStaking.checked = false;
    }
  }

  setManualDaemon(settings) {
    var manualDaemon = document.getElementById("manualDaemon");
    var manualDaemonSettings = document.getElementById(
      "manual-daemon-settings"
    );
    var automaticDaemonSettings = document.getElementById(
      "automatic-daemon-settings"
    );

    if (settings.manualDaemon == true) {
      manualDaemon.checked = true;
    }

    if (manualDaemon.checked) {
      manualDaemonSettings.style.display = "block";
      automaticDaemonSettings.style.display = "none";
    } else {
      manualDaemonSettings.style.display = "none";
      automaticDaemonSettings.style.display = "block";
    }
  }

  setManualDaemonUser(settings) {
    var manualDaemonUser = document.getElementById("manualDaemonUser");

    if (settings.manualDaemonUser === undefined) {
      manualDaemonUser.value = "rpcserver";
    } else {
      manualDaemonUser.value = settings.manualDaemonUser;
    }
  }

  setManualDaemonPassword(settings) {
    var manualDaemonPassword = document.getElementById("manualDaemonPassword");

    if (settings.manualDaemonPassword === undefined) {
      manualDaemonPassword.value = "password";
    } else {
      manualDaemonPassword.value = settings.manualDaemonPassword;
    }
  }

  setManualDaemonIP(settings) {
    var manualDaemonIP = document.getElementById("manualDaemonIP");

    if (settings.manualDaemonIP === undefined) {
      manualDaemonIP.value = "127.0.0.1";
    } else {
      manualDaemonIP.value = settings.manualDaemonIP;
    }
  }

  setManualDaemonPort(settings) {
    var manualDaemonPort = document.getElementById("manualDaemonPort");

    if (settings.manualDaemonPort === undefined) {
      manualDaemonPort.value = "9336";
    } else {
      manualDaemonPort.value = settings.manualDaemonPort;
    }
  }

  setManualDaemonDataDir(settings) {
    var manualDaemonDataDir = document.getElementById("manualDaemonDataDir");

    if (settings.manualDaemonDataDir === undefined) {
      manualDaemonDataDir.value = "Nexus_trit";
    } else {
      manualDaemonDataDir.value = settings.manualDaemonDataDir;
    }
  }

  setMapPortUsingUpnp(settings) {
    var mapPortUsingUpnp = document.getElementById("mapPortUsingUpnp");

    if (settings.mapPortUsingUpnp === undefined) {
      mapPortUsingUpnp.checked = true;
    }
    if (settings.mapPortUsingUpnp == true) {
      mapPortUsingUpnp.checked = true;
    }
    if (settings.mapPortUsingUpnp == false) {
      mapPortUsingUpnp.checked = false;
    }
  }

  setSocks4Proxy(settings) {
    var socks4Proxy = document.getElementById("socks4Proxy");
    var socks4ProxyIP = document.getElementById("socks4ProxyIP");
    var socks4ProxyPort = document.getElementById("socks4ProxyPort");

    if (settings.socks4Proxy === undefined) {
      socks4Proxy.checked = false;
    }
    if (settings.socks4Proxy == true) {
      socks4Proxy.checked = true;
    }
    if (settings.socks4Proxy == false) {
      socks4Proxy.checked = false;
    }

    if (!socks4Proxy.checked) {
      socks4ProxyIP.disabled = true;
      socks4ProxyPort.disabled = true;
    }
  }

  setSocks4ProxyIP(settings) {
    var socks4ProxyIP = document.getElementById("socks4ProxyIP");

    if (settings.socks4ProxyIP === undefined) {
      socks4ProxyIP.value = "127.0.0.1";
    } else {
      socks4ProxyIP.value = settings.socks4ProxyIP;
    }
  }

  setSocks4ProxyPort(settings) {
    var socks4ProxyPort = document.getElementById("socks4ProxyPort");

    if (settings.socks4ProxyPort === undefined) {
      socks4ProxyPort.value = "9050";
    } else {
      socks4ProxyPort.value = settings.socks4ProxyPort;
    }
  }

  setDetatchDatabaseOnShutdown(settings) {
    var detatchDatabaseOnShutdown = document.getElementById(
      "detatchDatabaseOnShutdown"
    );

    if (settings.detatchDatabaseOnShutdown === undefined) {
      detatchDatabaseOnShutdown.checked = false;
    }
    if (settings.detatchDatabaseOnShutdown == true) {
      detatchDatabaseOnShutdown.checked = true;
    }
    if (settings.detatchDatabaseOnShutdown == false) {
      detatchDatabaseOnShutdown.checked = false;
    }
  }

  updateEnableMining(event) {
    var el = even.target;
    var settings = require("../../api/settings.js");
    var settingsObj = settings.GetSettings();

    settingsObj.enableMining = el.checked;

    settings.SaveSettings(settingsObj);
  }

  updateEnableStaking(event) {
    var el = event.target;
    var settings = require("../../api/settings.js");
    var settingsObj = settings.GetSettings();

    settingsObj.enableStaking = el.checked;

    settings.SaveSettings(settingsObj);
  }

  updateManualDaemon(event) {
    var el = event.target;
    var settings = require("../../api/settings.js");
    var settingsObj = settings.GetSettings();

    settingsObj.manualDaemon = el.checked;
    settings.SaveSettings(settingsObj);

    var manualDaemonSettings = document.getElementById(
      "manual-daemon-settings"
    );
    var automaticDaemonSettings = document.getElementById(
      "automatic-daemon-settings"
    );

    if (el.checked) {
      manualDaemonSettings.style.display = "block";
      automaticDaemonSettings.style.display = "none";
    } else {
      manualDaemonSettings.style.display = "none";
      automaticDaemonSettings.style.display = "block";
    }
  }

  updateManualDaemonUser(event) {
    var el = event.target;
    var settings = require("../../api/settings.js");
    var settingsObj = settings.GetSettings();

    settingsObj.manualDaemonUser = el.value;

    settings.SaveSettings(settingsObj);
  }

  updateManualDaemonPassword(event) {
    var el = event.target;
    var settings = require("../../api/settings.js");
    var settingsObj = settings.GetSettings();

    settingsObj.manualDaemonPassword = el.value;

    settings.SaveSettings(settingsObj);
  }

  updateManualDaemonIP(event) {
    var el = event.target;
    var settings = require("../../api/settings.js");
    var settingsObj = settings.GetSettings();

    settingsObj.manualDaemonIP = el.value;

    settings.SaveSettings(settingsObj);
  }

  updateManualDaemonPort(event) {
    var el = event.target;
    var settings = require("../../api/settings.js");
    var settingsObj = settings.GetSettings();

    settingsObj.manualDaemonPort = el.value;

    settings.SaveSettings(settingsObj);
  }

  updateManualDaemonDataDir(event) {
    var el = event.target;
    var settings = require("../../api/settings.js");
    var settingsObj = settings.GetSettings();

    settingsObj.manualDaemonDataDir = el.value;

    settings.SaveSettings(settingsObj);
  }

  updateMapPortUsingUpnp(event) {
    var el = event.target;
    var settings = require("../../api/settings.js");
    var settingsObj = settings.GetSettings();

    settingsObj.mapPortUsingUpnp = el.checked;

    settings.SaveSettings(settingsObj);
  }

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
    } else {
      socks4ProxyIP.disabled = true;
      socks4ProxyPort.disabled = true;
    }
  }

  updateSocks4ProxyIP(event) {
    var el = event.target;
    var settings = require("../../api/settings.js");
    var settingsObj = settings.GetSettings();

    settingsObj.socks4ProxyIP = el.value;

    settings.SaveSettings(settingsObj);
  }

  updateSocks4ProxyPort(event) {
    var el = event.target;
    var settings = require("../../api/settings.js");
    var settingsObj = settings.GetSettings();

    settingsObj.socks4ProxyPort = el.value;

    settings.SaveSettings(settingsObj);
  }

  updateDetatchDatabaseOnShutdown(event) {
    var el = event.target;
    var settings = require("../../api/settings.js");
    var settingsObj = settings.GetSettings();
    settingsObj.detatchDatabaseOnShutdown = el.checked;

    settings.SaveSettings(settingsObj);
  }

  coreRestart() {
    core.restart();
  }

  // Mandatory React method
  render() {
    return (
      <section id="core">
        <Modal
          center
          classNames={{ modal: "custom-modal2" }}
          showCloseIcon={false}
          open={this.props.openSecondModal}
          onClose={this.props.CloseModal2}
        >
          <div>
            <h2>Save Settings?</h2>
            <div className="note">
              Changes to core settings will take effect the next time the core
              is restarted.
            </div>

            <input
              value="Yes"
              type="button"
              className="button primary"
              onClick={() => {
                this.props.setSettings(
                  require("../../api/settings.js").GetSettings()
                );
                this.props.CloseModal2();
                this.props.OpenModal("Core Settings Saved");
                setTimeout(() => {
                  this.props.CloseModal();
                }, 2000);
              }}
            />
            <div id="no-button">
              <input
                value="No"
                type="button"
                className="button primary"
                onClick={() => {
                  this.props.CloseModal2();
                }}
              />
            </div>
          </div>
        </Modal>

        <form className="aligned">
          <div className="field">
            <label htmlFor="enableMining">Enable Mining</label>
            <input
              id="enableMining"
              type="checkbox"
              className="switch"
              onChange={this.updateEnableMining}
              data-tooltip="Enable/Disable mining to the wallet"
            />
          </div>

          <div className="field">
            <label htmlFor="enableStaking">Enable Staking</label>
            <input
              id="enableStaking"
              type="checkbox"
              className="switch"
              onChange={this.updateEnableStaking}
              data-tooltip="Enable/Disable staking on the wallet"
            />
          </div>

          <div className="field">
            <label htmlFor="manualDaemon">Manual Daemon Mode</label>
            <input
              id="manualDaemon"
              type="checkbox"
              className="switch"
              onChange={this.updateManualDaemon}
              data-tooltip="Enable manual daemon mode if you are running the daemon manually outside of the wallet"
            />
          </div>

          <div id="manual-daemon-settings">
            <div className="field">
              <label htmlFor="manualDaemonUser">Username</label>
              <input
                id="manualDaemonUser"
                type="text"
                size="12"
                onChange={this.updateManualDaemonUser}
                data-tooltip="Username configured for manual daemon"
              />
            </div>

            <div className="field">
              <label htmlFor="manualDaemonPassword">Password</label>
              <input
                id="manualDaemonPassword"
                type="text"
                size="12"
                onChange={this.updateManualDaemonPassword}
                data-tooltip="Password configured for manual daemon"
              />
            </div>

            <div className="field">
              <label htmlFor="manualDaemonIP">IP Address</label>
              <input
                id="manualDaemonIP"
                type="text"
                size="12"
                onChange={this.updateManualDaemonIP}
                data-tooltip="IP address configured for manual daemon"
              />
            </div>

            <div className="field">
              <label htmlFor="manualDaemonPort">Port</label>
              <input
                id="manualDaemonPort"
                type="text"
                size="3"
                onChange={this.updateManualDaemonPort}
                data-tooltip="Port configured for manual daemon"
              />
            </div>

            <div className="field">
              <label htmlFor="manualDaemonDataDir">Data Directory Name</label>
              <input
                id="manualDaemonDataDir"
                type="text"
                size="12"
                onChange={this.updateManualDaemonDataDir}
                data-tooltip="Data directory configured for manual daemon"
              />
            </div>
          </div>

          <div id="automatic-daemon-settings">
            <div className="field">
              <label htmlFor="mapPortUsingUpnp">Map port using UPnP</label>
              <input
                id="mapPortUsingUpnp"
                type="checkbox"
                className="switch"
                onChange={this.updateMapPortUsingUpnp}
                data-tooltip="Automatically open the Nexus client port on the router. This only works when your router supports UPnP and it is enabled."
              />
            </div>

            <div className="field">
              <label htmlFor="socks4Proxy">Connect through SOCKS4 proxy</label>
              <input
                id="socks4Proxy"
                type="checkbox"
                className="switch"
                onChange={this.updateSocks4Proxy}
                data-tooltip="Connect to Nexus through a SOCKS4 proxt (e.g. when connecting through Tor"
              />
            </div>

            <div className="field">
              <label htmlFor="socks4ProxyIP">Proxy IP Address</label>
              <input
                id="socks4ProxyIP"
                type="text"
                size="12"
                onChange={this.updateSocks4ProxyIP}
                data-tooltip="IP Address of SOCKS4 proxy server"
              />
            </div>

            <div className="field">
              <label htmlFor="socks4ProxyPort">Proxy Port</label>
              <input
                id="socks4ProxyPort"
                type="text"
                size="3"
                onChange={this.updateSocks4ProxyPort}
                data-tooltip="Port of SOCKS4 proxy server"
              />
            </div>

            <div className="field">
              <label htmlFor="detatchDatabaseOnShutdown">
                Detach database on shutdown
              </label>
              <input
                id="detatchDatabaseOnShutdown"
                type="checkbox"
                className="switch"
                onChange={this.updateDetatchDatabaseOnShutdown}
                data-tooltip="Detatch the database when shutting down the wallet"
              />
            </div>
            <button
              id="restart-core"
              className="button primary"
              onClick={e => {
                e.preventDefault();
                core.restart();
              }}
            >
              Restart Core
            </button>
            <button
              // id="restart-core"
              className="button primary"
              onClick={e => {
                e.preventDefault();
                this.props.OpenModal2();
              }}
            >
              Save Settings
            </button>
          </div>

          <div className="clear-both" />
        </form>

        {/* <button className="button primary" onClick={application.restart()}>Restart Core</button> */}
      </section>
    );
  }
}

// Mandatory React-Redux method
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SettingsCore);
