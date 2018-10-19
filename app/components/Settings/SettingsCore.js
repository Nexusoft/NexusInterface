import React, { Component } from "react";
import { Link } from "react-router-dom";
import styles from "./style.css";
import * as RPC from "../../script/rpc";
import * as TYPE from "../../actions/actiontypes";
import ContextMenuBuilder from "../../contextmenu";
import { remote } from "electron";
import { access } from "fs";
import { connect } from "react-redux";
import { FormattedMessage } from "react-intl";
import * as FlagFile from "../../actions/LanguageFlags";

const mapStateToProps = state => {
  return {
    ...state.common,
    ...state.settings,
    ...state.intl
  };
};
const mapDispatchToProps = dispatch => ({
  setSettings: settings =>
    dispatch({ type: TYPE.GET_SETTINGS, payload: settings }),
  OpenModal: type => {
    dispatch({ type: TYPE.SHOW_MODAL, payload: type });
  },
  localeChange: returnSelectedLocale => {
    dispatch({ type: TYPE.SWITCH_LOCALES, payload: returnSelectedLocale });
  },
  SwitchLocale: locale => {
    dispatch({ type: TYPE.UPDATE_LOCALES });
  },
  CloseModal: () => dispatch({ type: TYPE.HIDE_MODAL })
});

class SettingsCore extends Component {
  /// Compent Did Mount
  /// React Lifecycle on page load.
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
    // this.setOptionalTransactionFee(settings);
  }

  componentWillUnmount() {
    this.props.setSettings(require("../../api/settings.js").GetSettings());
    this.props.OpenModal("Settings saved");
    setTimeout(() => {
      this.props.CloseModal();
    }, 2000);
  }

  /// Set Manual Daemon
  /// Sets the HTML element toggle for Manual Deamon Mode
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

  /// Set Manual Daemon User
  /// Sets the HTML element toggle for ManuelDaemonUser
  setManualDaemonUser(settings) {
    var manualDaemonUser = document.getElementById("manualDaemonUser");

    if (settings.manualDaemonUser === undefined) {
      manualDaemonUser.value = "rpcserver";
    } else {
      manualDaemonUser.value = settings.manualDaemonUser;
    }
  }

  /// Set Manual Daemon Password
  /// Sets the HTML element toggle for ManualDaemonPassword
  setManualDaemonPassword(settings) {
    var manualDaemonPassword = document.getElementById("manualDaemonPassword");

    if (settings.manualDaemonPassword === undefined) {
      manualDaemonPassword.value = "password";
    } else {
      manualDaemonPassword.value = settings.manualDaemonPassword;
    }
  }

  /// Set Manual Daemon IP
  /// Sets the HTML element toggle for ManualDeamonIP
  setManualDaemonIP(settings) {
    var manualDaemonIP = document.getElementById("manualDaemonIP");

    if (settings.manualDaemonIP === undefined) {
      manualDaemonIP.value = "127.0.0.1";
    } else {
      manualDaemonIP.value = settings.manualDaemonIP;
    }
  }

  /// Set Manual Daemon Port
  /// Sets the HTML element toggle for ManualDaemonPort
  setManualDaemonPort(settings) {
    var manualDaemonPort = document.getElementById("manualDaemonPort");

    if (settings.manualDaemonPort === undefined) {
      manualDaemonPort.value = "9336";
    } else {
      manualDaemonPort.value = settings.manualDaemonPort;
    }
  }

  /// Set Map Port Using Upnp
  /// Sets the HTML element toggle for MapPortUsingUpnp
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

  /// Set Socks4 Proxy
  /// Sets the HTML element toggle for Socks4Proxy
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

  /// Set Socks4ProxyIP
  /// Sets the HTML element toggle for Socks4ProxyIP
  setSocks4ProxyIP(settings) {
    var socks4ProxyIP = document.getElementById("socks4ProxyIP");

    if (settings.socks4ProxyIP === undefined) {
      socks4ProxyIP.value = "127.0.0.1";
    } else {
      socks4ProxyIP.value = settings.socks4ProxyIP;
    }
  }

  /// Set Socks4 Proxy Port
  /// Sets the HTML element toggle for Socks4ProxyPort
  setSocks4ProxyPort(settings) {
    var socks4ProxyPort = document.getElementById("socks4ProxyPort");

    if (settings.socks4ProxyPort === undefined) {
      socks4ProxyPort.value = "9050";
    } else {
      socks4ProxyPort.value = settings.socks4ProxyPort;
    }
  }

  /// Set Detatch Database On Shutdown
  /// Sets the HTML element toggle for DetachDatabaseOnShutdown
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

  /// Update Manual Daemon
  /// Update the Settings for the ManualDaemon
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

  /// Update Manual Daemon User
  /// Update the Settings for the ManualDaemonDaemonUser
  updateManualDaemonUser(event) {
    var el = event.target;
    var settings = require("../../api/settings.js");
    var settingsObj = settings.GetSettings();

    settingsObj.manualDaemonUser = el.value;

    settings.SaveSettings(settingsObj);
  }

  /// Update Manuel Daemon Password
  /// Update the Settings for the ManualDaemonPassword
  updateManualDaemonPassword(event) {
    var el = event.target;
    var settings = require("../../api/settings.js");
    var settingsObj = settings.GetSettings();

    settingsObj.manualDaemonPassword = el.value;

    settings.SaveSettings(settingsObj);
  }

  /// Update Manual Daemon IP
  /// Update the Settings for the ManualDaemonIP
  updateManualDaemonIP(event) {
    var el = event.target;
    var settings = require("../../api/settings.js");
    var settingsObj = settings.GetSettings();

    settingsObj.manualDaemonIP = el.value;

    settings.SaveSettings(settingsObj);
  }

  /// Update Manual Deamon Port
  /// Update the Settings for the ManualDaemonPort
  updateManualDaemonPort(event) {
    var el = event.target;
    var settings = require("../../api/settings.js");
    var settingsObj = settings.GetSettings();

    settingsObj.manualDaemonPort = el.value;

    settings.SaveSettings(settingsObj);
  }

  /// Update Map Port Using Upnp
  /// Update the Settings for the MapPortUsingUpnp
  updateMapPortUsingUpnp(event) {
    var el = event.target;
    var settings = require("../../api/settings.js");
    var settingsObj = settings.GetSettings();

    settingsObj.mapPortUsingUpnp = el.checked;

    settings.SaveSettings(settingsObj);
  }

  /// Update Socks4 Proxy
  /// Update the Settings for the Socks4Proxy
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

  /// Update Socks4 Proxy IP
  /// Update the Settings for the Socks4ProxyIP
  updateSocks4ProxyIP(event) {
    var el = event.target;
    var settings = require("../../api/settings.js");
    var settingsObj = settings.GetSettings();

    settingsObj.socks4ProxyIP = el.value;

    settings.SaveSettings(settingsObj);
  }

  /// Update Socks4ProxyPort
  /// Update the Settings for the Socks4ProxyPort
  updateSocks4ProxyPort(event) {
    var el = event.target;
    var settings = require("../../api/settings.js");
    var settingsObj = settings.GetSettings();

    settingsObj.socks4ProxyPort = el.value;

    settings.SaveSettings(settingsObj);
  }

  /// Update Detach Database On Shutdown
  /// Update the Settings for the DetachOnShotdown
  updateDetatchDatabaseOnShutdown(event) {
    var el = event.target;
    var settings = require("../../api/settings.js");
    var settingsObj = settings.GetSettings();
    settingsObj.detatchDatabaseOnShutdown = el.checked;

    settings.SaveSettings(settingsObj);
  }

  /// Core Restart
  /// Restart the Core
  coreRestart() {
    let core = require("electron").remote.getGlobal("core");
    core.restart();
  }

  render() {
    console.log(FlagFile.America);
    return (
      <section id="core">
        <div className="note">
          <FormattedMessage
            id="Settings.ChangesNexTime"
            defaultMesage="Changes to core settings will take effect the next time the core is restarted"
          />
        </div>

        <form className="aligned">
          <div className="field">
            <label htmlFor="manualDaemon">
              {" "}
              <FormattedMessage
                id="Settings.ManualDaemonMode"
                defaultMesage="Manual Daemon Mode"
              />
            </label>
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
              <label htmlFor="manualDaemonUser">
                <FormattedMessage
                  id="Settings.Username"
                  defaultMesage="Username"
                />
              </label>
              <input
                id="manualDaemonUser"
                type="text"
                size="12"
                onChange={this.updateManualDaemonUser}
                data-tooltip="Username configured for manual daemon"
              />
            </div>

            <div className="field">
              <label htmlFor="manualDaemonPassword">
                {" "}
                <FormattedMessage
                  id="Settings.Password"
                  defaultMesage="Password"
                />
              </label>
              <input
                id="manualDaemonPassword"
                type="text"
                size="12"
                onChange={this.updateManualDaemonPassword}
                data-tooltip="Password configured for manual daemon"
              />
            </div>

            <div className="field">
              <label htmlFor="manualDaemonIP">
                {" "}
                <FormattedMessage
                  id="Settings.IpAddress"
                  defaultMesage="Ip Address"
                />
              </label>
              <input
                id="manualDaemonIP"
                type="text"
                size="12"
                onChange={this.updateManualDaemonIP}
                data-tooltip="IP address configured for manual daemon"
              />
            </div>

            <div className="field">
              <label htmlFor="manualDaemonPort">
                <FormattedMessage id="Settings.Port" defaultMesage="Port" />
              </label>
              <input
                id="manualDaemonPort"
                type="text"
                size="3"
                onChange={this.updateManualDaemonPort}
                data-tooltip="Port configured for manual daemon"
              />
            </div>
          </div>

          <div id="automatic-daemon-settings">
            <div className="field">
              <label htmlFor="mapPortUsingUpnp">
                {" "}
                <FormattedMessage
                  id="Settings.UPnp"
                  defaultMesage="Map port using UPnP"
                />
              </label>
              <input
                id="mapPortUsingUpnp"
                type="checkbox"
                className="switch"
                onChange={this.updateMapPortUsingUpnp}
                data-tooltip="Automatically open the Nexus client port on the router. This only works when your router supports UPnP and it is enabled."
              />
            </div>

            <div className="field">
              <label htmlFor="socks4Proxy">
                <FormattedMessage
                  id="Settings.Socks4proxy"
                  defaultMesage="Connect through SOCKS4 proxy"
                />
              </label>
              <input
                id="socks4Proxy"
                type="checkbox"
                className="switch"
                onChange={this.updateSocks4Proxy}
                data-tooltip="Connect to Nexus through a SOCKS4 proxt (e.g. when connecting through Tor"
              />
            </div>

            <div className="field">
              <label htmlFor="socks4ProxyIP">
                <FormattedMessage
                  id="Settings.ProxyIP"
                  defaultMesage="Proxy IP Address"
                />
              </label>
              <input
                id="socks4ProxyIP"
                type="text"
                size="12"
                onChange={this.updateSocks4ProxyIP}
                data-tooltip="IP Address of SOCKS4 proxy server"
              />
            </div>

            <div className="field">
              <label htmlFor="socks4ProxyPort">
                <FormattedMessage
                  id="Settings.ProxyPort"
                  defaultMesage="Proxy Port"
                />
              </label>
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
                <FormattedMessage
                  id="Settings.Detach"
                  defaultMesage="Detach database on shutdown"
                />
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
              onClick={this.coreRestart}
            >
              <FormattedMessage
                id="Settings.RestartCore"
                defaultMesage="Restart Core"
              />
            </button>
          </div>

          <div className="field">
            <label htmlFor="optionalTransactionFee">
              <FormattedMessage
                id="Settings.Language"
                defaultMesage="Language"
              />
            </label>
            <div className="langSet">
              <select
                className="language"
                onChange={e => this.props.localeChange(e.target.value)}
                value={this.props.tempStorage}
              >
                <option value="en">
                  <FormattedMessage
                    id="Settings.English"
                    defaultMesage="English"
                  />
                </option>
                <option value="ru">
                  <FormattedMessage
                    id="Settings.Russian"
                    defaultMesage="Russian"
                  />
                </option>
              </select>
              <span className="flag-icon-background flag-icon-gr" />
              <button
                type="button"
                className="feebutton"
                onClick={() => this.props.SwitchLocale()}
              >
                <FormattedMessage id="Settings.Set" defaultMesage="Set" />
              </button>
            </div>
          </div>

          {/* <select
            onChange={e => this.props.localeChange(e.target.value)}
             value={this.props.tempStorage}
          >
            <option value="en">English</option>
            <option value="ru">Russian</option>
          </select>
          <button
            type="button"
            className="medium button"
            onClick={() => this.props.SwitchLocale()}
          >
            Asshole
          </button> */}
          <div className="clear-both" />
        </form>

        {/* <button className="button primary" onClick={application.restart()}>Restart Core</button> */}
      </section>
    );
  }
}
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SettingsCore);
