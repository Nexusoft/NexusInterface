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
import { FormattedMessage } from "react-intl";
import * as FlagFile from "../../actions/LanguageFlags";

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
  OpenModal2: type => {
    dispatch({ type: TYPE.SHOW_MODAL2, payload: type });
  },
  OpenModal3: type => {
    dispatch({ type: TYPE.SHOW_MODAL3, payload: type });
  },
  CloseModal2: type => {
    dispatch({ type: TYPE.HIDE_MODAL2, payload: type });
  },
  CloseModal3: type => {
    dispatch({ type: TYPE.HIDE_MODAL3, payload: type });
  },
  localeChange: returnSelectedLocale => {
    dispatch({ type: TYPE.SWITCH_LOCALES, payload: returnSelectedLocale });
  },
  SwitchLocale: locale => {
    dispatch({ type: TYPE.UPDATE_LOCALES, payload: locale });
  },

  CloseModal: () => dispatch({ type: TYPE.HIDE_MODAL })
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
    this.setVerboseLevel(settings);
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

  setVerboseLevel(settings) {
    var verboseLevel = document.getElementById("verboseLevel");

    if (settings.verboseLevel === undefined) {
      verboseLevel.value = "2";
    } else {
      verboseLevel.value = settings.verboseLevel;
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

  updateVerboseLevel(event) {
    var el = event.target;
    var settings = require("../../api/settings.js");
    var settingsObj = settings.GetSettings();

    settingsObj.verboseLevel = el.value;

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

  changeLocale(locale) {
    let settings = require("../../api/settings.js").GetSettings();
    settings.locale = locale;
    this.props.setSettings(settings);
    this.props.SwitchLocale(locale);
    require("../../api/settings.js").SaveSettings(settings);
  }

  // Mandatory React method
  render() {
    console.log(this.props.settings.locale);
    return (
      <section id="core">
        <Modal
          center
          classNames={{ modal: "custom-modal5" }}
          showCloseIcon={true}
          open={this.props.openThirdModal}
          onClose={this.props.CloseModal3}
        >
          <ul className="langList">
            {/* ENGLISH */}
            <li className="LanguageTranslation">
              &emsp;
              <input
                id="English"
                name="radio-group"
                type="radio"
                value="en"
                checked={this.props.settings.locale === "en"}
                onClick={() => this.changeLocale("en")}

                // onChange={e => this.changeLocale(e.target.value)}
              />
              &emsp;
              <label htmlFor="English">
                <FormattedMessage id="Lang.English" defaultMessage="English" />
              </label>
              &emsp; &emsp; &emsp;
              <span className="langTag">
                <img src={FlagFile.America} />
                (English, US) &emsp;
              </span>
            </li>

            {/* RUSSIAN */}
            <li className="LanguageTranslation">
              &emsp;
              <input
                id="Russian"
                name="radio-group"
                type="radio"
                value="ru"
                checked={this.props.settings.locale === "ru"}
                onClick={() => this.changeLocale("ru")}
                // checked={this.props.tempStorage === "ru"}
                // onChange={e => this.changeLocale(e.target.value)}
              />
              &emsp;
              <label htmlFor="Russian">
                <FormattedMessage id="Lang.Russian" defaultMessage="Russian" />
              </label>
              &emsp; &emsp; &emsp;
              <span className="langTag">
                <img src={FlagFile.Russia} />
                (Pусский) &emsp;
              </span>
            </li>
            {/* SPANISH */}
            <li className="LanguageTranslation">
              &emsp;
              <input
                id="Spanish"
                name="radio-group"
                type="radio"
                value="es"
                checked={this.props.settings.locale === "es"}
                onClick={() => this.changeLocale("es")}
                // checked={this.props.tempStorage === "ru"}
                // onChange={e => this.changeLocale(e.target.value)}
              />
              &emsp;
              <label htmlFor="Spanish">
                <FormattedMessage id="Lang.Spanish" defaultMessage="Spanish" />
              </label>
              &emsp; &emsp; &emsp;
              <span className="langTag">
                <img src={FlagFile.Spain} />
                (español) &emsp;
              </span>
            </li>
          </ul>
          <div className="langsetter">
            {/* <button
              type="button"
              className="feebutton"
              onClick={() => this.props.SwitchLocale()}
            >
              <FormattedMessage id="Settings.Set" defaultMesage="Set" />
            </button> */}
          </div>
        </Modal>
        <div className="note">
          <FormattedMessage
            id="Settings.ChangesNexTime"
            defaultMesage="Changes to core settings will take effect the next time the core is restarted"
          />
        </div>
        <Modal
          center
          classNames={{ modal: "custom-modal2", overlay: "custom-overlay" }}
          showCloseIcon={false}
          open={this.props.openSecondModal}
          onClose={this.props.CloseModal2}
        >
          <div>
            <h2>
              <FormattedMessage
                id="Settings.SaveSettings"
                defaultMessage="Save Settings"
              />
              ?
            </h2>
            <div className="note">
              <FormattedMessage
                id="Settings.ChangesNexTime"
                defaultMessage="Changes to core settings will take effect the next time the core is restarted"
              />
            </div>{" "}
            <FormattedMessage id="Settings.Yes" defaultMessage="Yes">
              {y => (
                <input
                  value={y}
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
              )}
            </FormattedMessage>
            <div id="no-button">
              <FormattedMessage id="Settings.No">
                {n => (
                  <input
                    value={n}
                    type="button"
                    className="button primary"
                    onClick={() => {
                      this.props.CloseModal2();
                    }}
                  />
                )}
              </FormattedMessage>
            </div>
          </div>
        </Modal>

        <form className="aligned">
          <div className="field">
            <label htmlFor="enableMining">
              <FormattedMessage
                id="Settings.EnableMining"
                defaultMessage="Enable Mining"
              />
            </label>
            <FormattedMessage
              id="ToolTip.EnableMining"
              defaultMessage="Enable/Disable mining to the wallet"
            >
              {tt => (
                <input
                  id="enableMining"
                  type="checkbox"
                  className="switch"
                  onChange={this.updateEnableMining}
                  data-tooltip={tt}
                />
              )}
            </FormattedMessage>
          </div>

          <div className="field">
            <label htmlFor="enableStaking">
              <FormattedMessage
                id="Settings.EnableStaking"
                defaultMessage="Enable Staking"
              />
            </label>
            <FormattedMessage
              id="ToolTip.EnableStaking"
              defaultMessage="Enable/Disable Staking to the wallet"
            >
              {tt => (
                <input
                  id="enableStaking"
                  type="checkbox"
                  className="switch"
                  onChange={this.updateEnableStaking}
                  data-tooltip={tt}
                />
              )}
            </FormattedMessage>
          </div>

          <div className="field">
            <label htmlFor="verboseLevel">
              <FormattedMessage
                id="Settings.VerboseLevel"
                defaultMessage="Verbose Level"
              />
            </label>
            <FormattedMessage
              id="ToolTip.Verbose"
              defaultMessage="Verbose level for logs"
            >
              {TT => (
                <input
                  id="verboseLevel"
                  type="text"
                  size="3"
                  onChange={this.updateVerboseLevel}
                  data-tooltip={TT}
                />
              )}
            </FormattedMessage>
          </div>

          <div className="field">
            <label htmlFor="manualDaemon">
              <FormattedMessage
                id="Settings.ManualDaemonMode"
                defaultMessage="Manual Daemon Mode"
              />
            </label>
            <FormattedMessage
              id="ToolTip.MDM"
              defaultMessage="Enable manual daemon mode if you are running the daemon manually outside of the wallet"
            >
              {tt => (
                <input
                  id="manualDaemon"
                  type="checkbox"
                  className="switch"
                  onChange={this.updateManualDaemon}
                  data-tooltip={tt}
                />
              )}
            </FormattedMessage>
          </div>

          <div id="manual-daemon-settings">
            <div className="field">
              <label htmlFor="manualDaemonUser">
                <FormattedMessage
                  id="Settings.Username"
                  defaultMesage="Username"
                />
              </label>
              <FormattedMessage
                id="ToolTip.UserName"
                defaultMessage="Username configured for manual daemon"
              >
                {tt => (
                  <input
                    id="manualDaemonUser"
                    type="text"
                    size="12"
                    onChange={this.updateManualDaemonUser}
                    data-tooltip={tt}
                  />
                )}
              </FormattedMessage>
            </div>

            <div className="field">
              <label htmlFor="manualDaemonPassword">
                {" "}
                <FormattedMessage
                  id="Settings.Password"
                  defaultMesage="Password"
                />
              </label>
              <FormattedMessage
                id="ToolTip.Password"
                defaultMessage="Password configured for manual daemon"
              >
                {tt => (
                  <input
                    id="manualDaemonPassword"
                    type="text"
                    size="12"
                    onChange={this.updateManualDaemonPassword}
                    data-tooltip={tt}
                  />
                )}
              </FormattedMessage>
            </div>

            <div className="field">
              <label htmlFor="manualDaemonIP">
                {" "}
                <FormattedMessage
                  id="Settings.IpAddress"
                  defaultMesage="Ip Address"
                />
              </label>
              <FormattedMessage
                id="ToolTip.IP"
                defaultMessage="IP address configured for manual daemon"
              >
                {tt => (
                  <input
                    id="manualDaemonIP"
                    type="text"
                    size="12"
                    onChange={this.updateManualDaemonIP}
                    data-tooltip={tt}
                  />
                )}
              </FormattedMessage>
            </div>

            <div className="field">
              <label htmlFor="manualDaemonPort">
                <FormattedMessage id="Settings.Port" defaultMesage="Port" />
              </label>
              <FormattedMessage
                id="ToolTip.PortConfig"
                defaultMessage="Port configured for manual daemon"
              >
                {tt => (
                  <input
                    id="manualDaemonPort"
                    type="text"
                    size="5"
                    onChange={this.updateManualDaemonPort}
                    data-tooltip={tt}
                  />
                )}
              </FormattedMessage>
            </div>

            <div className="field">
              <label htmlFor="manualDaemonDataDir">
                <FormattedMessage
                  id="Settings.DDN"
                  defaultMessage="Data Directory Name"
                />{" "}
              </label>
              <FormattedMessage
                id="ToolTip.DataDirectory"
                defaultMessage="Data directory configured for manual daemon"
              >
                {tt => (
                  <input
                    id="manualDaemonDataDir"
                    type="text"
                    size="12"
                    onChange={this.updateManualDaemonDataDir}
                    data-tooltip={tt}
                  />
                )}
              </FormattedMessage>
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
              <FormattedMessage
                id="ToolTip.UPnP"
                defaultMessage="Automatically open the Nexus client port on the router. This only works when your router supports UPnP and it is enabled."
              >
                {tt => (
                  <input
                    id="mapPortUsingUpnp"
                    type="checkbox"
                    className="switch"
                    onChange={this.updateMapPortUsingUpnp}
                    data-tooltip={tt}
                  />
                )}
              </FormattedMessage>
            </div>

            <div className="field">
              <label htmlFor="socks4Proxy">
                <FormattedMessage
                  id="Settings.Socks4proxy"
                  defaultMesage="Connect through SOCKS4 proxy"
                />
              </label>
              <FormattedMessage
                id="ToolTip.Socks4"
                defaultMessage="Connect to Nexus through a SOCKS4 proxt (e.g. when connecting through Tor)"
              >
                {tt => (
                  <input
                    id="socks4Proxy"
                    type="checkbox"
                    className="switch"
                    onChange={this.updateSocks4Proxy}
                    data-tooltip={tt}
                  />
                )}
              </FormattedMessage>
            </div>

            <div className="field">
              <label htmlFor="socks4ProxyIP">
                <FormattedMessage
                  id="Settings.ProxyIP"
                  defaultMesage="Proxy IP Address"
                />
              </label>
              <FormattedMessage
                id="ToolTip.IPAddressofSOCKS4proxy"
                defaultMessage="IP Address of SOCKS4 proxy server"
              >
                {tt => (
                  <input
                    id="socks4ProxyIP"
                    type="text"
                    size="12"
                    onChange={this.updateSocks4ProxyIP}
                    data-tooltip={tt}
                  />
                )}
              </FormattedMessage>
            </div>

            <div className="field">
              <label htmlFor="socks4ProxyPort">
                <FormattedMessage
                  id="Settings.ProxyPort"
                  defaultMesage="Proxy Port"
                />
              </label>
              <FormattedMessage
                id="ToolTip.PortOfSOCKS4proxyServer"
                defaultMessage="Port of SOCKS4 proxy server"
              >
                {tt => (
                  <input
                    id="socks4ProxyPort"
                    type="text"
                    size="3"
                    onChange={this.updateSocks4ProxyPort}
                    data-tooltip={tt}
                  />
                )}
              </FormattedMessage>
            </div>

            <div className="field">
              <label htmlFor="detatchDatabaseOnShutdown">
                <FormattedMessage
                  id="Settings.Detach"
                  defaultMesage="Detach database on shutdown"
                />
              </label>
              <FormattedMessage
                id="ToolTip.Detach"
                defaultMessage="Detach the database when shutting down the wallet"
              >
                {tt => (
                  <input
                    id="detatchDatabaseOnShutdown"
                    type="checkbox"
                    className="switch"
                    onChange={this.updateDetatchDatabaseOnShutdown}
                    data-tooltip={tt}
                  />
                )}
              </FormattedMessage>
            </div>
            <div className="field">
              <label htmlFor="optionalTransactionFee">
                <FormattedMessage
                  id="Settings.Language"
                  defaultMesage="Language"
                />
              </label>
              <div className="langSet">
                {/* <select
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
                </select> */}
                <span className="flag-icon-background flag-icon-gr" />
                <button
                  type="button"
                  className="Languagebutton"
                  // onClick={() => this.props.SwitchLocale()}
                  onClick={() => this.props.OpenModal3()}
                >
                  <FormattedMessage
                    id="Settings.LangButton"
                    defaultMesage="English"
                  />
                </button>
              </div>
            </div>
            <button
              id="restart-core"
              className="button primary"
              onClick={e => {
                e.preventDefault();
                core.restart();
              }}
            >
              <FormattedMessage
                id="Settings.RestartCore"
                defaultMesage="Restart Core"
              />
            </button>
            <button
              // id="restart-core"
              className="button primary"
              onClick={e => {
                e.preventDefault();
                this.props.OpenModal2();
              }}
            >
              <FormattedMessage
                id="Settings.SaveSettings"
                defaultMessage="Save Settings"
              />
            </button>
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

// Mandatory React-Redux method
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SettingsCore);
