/*
  Title: App settings
  Description: Control App settings.
  Last Modified by: Brian Smith
*/
// External Dependencies
import React, { Component } from "react";
import { Link } from "react-router-dom";
import { remote } from "electron";
import { access } from "fs";
import Modal from "react-responsive-modal";
import { connect } from "react-redux";

// Internal Dependencies
import styles from "./style.css";
import * as RPC from "../../script/rpc";
import * as TYPE from "../../actions/actiontypes";
import ContextMenuBuilder from "../../contextmenu";

// React-Redux mandatory methods
const mapStateToProps = state => {
  return {
    ...state.common,
    ...state.sendRecieve,
    ...state.overview,
    ...state.settings
  };
};
const mapDispatchToProps = dispatch => ({
  OpenModal2: type => {
    dispatch({ type: TYPE.SHOW_MODAL2, payload: type });
  },
  CloseModal2: type => {
    dispatch({ type: TYPE.HIDE_MODAL2, payload: type });
  },
  OpenModal: type => {
    dispatch({ type: TYPE.SHOW_MODAL, payload: type });
  },
  CloseModal: () => dispatch({ type: TYPE.HIDE_MODAL }),
  setSettings: settings =>
    dispatch({ type: TYPE.GET_SETTINGS, payload: settings }),
  setFiatCurrency: inValue => {
    dispatch({ type: TYPE.SET_FIAT_CURRENCY, payload: inValue });
  }
});

var currentBackupLocation = ""; //Might redo to use redux but this is only used to replace using json reader every render;

class SettingsApp extends Component {
  // React Method (Life cycle hook)
  componentDidMount() {
    var settings = require("../../api/settings.js").GetSettings();
    // this.setDefaultUnitAmount(settings);
    //Application settings
    this.setAutostart(settings);
    this.setMinimizeToTray(settings);
    this.setMinimizeOnClose(settings);
    this.setGoogleAnalytics(settings);
    this.setDeveloperMode(settings);
    this.setInfoPopup(settings);
    this.setSavedTxFee(settings);

    if (this.refs.backupInputField) {
      this.refs.backupInputField.webkitdirectory = true;
      this.refs.backupInputField.directory = true;
    }
    //this.OnFiatCurrencyChange = this.OnFiatCurrencyChange.bind(this);
  }
  // React Method (Life cycle hook)
  componentWillUnmount() {
    this.props.setSettings(require("../../api/settings.js").GetSettings());
  }

  // Class Methods
  setAutostart(settings) {
    var autostart = document.getElementById("autostart");

    if (settings.autostart === undefined) {
      autostart.checked = false;
    }
    if (settings.autostart == true) {
      autostart.checked = true;
    }
    if (settings.autostart == false) {
      autostart.checked = false;
    }
  }

  setMinimizeToTray(settings) {
    var minimizeToTray = document.getElementById("minimizeToTray");

    if (settings.minimizeToTray === undefined) {
      minimizeToTray.checked = false;
    }
    if (settings.minimizeToTray == true) {
      minimizeToTray.checked = true;
    }
    if (settings.minimizeToTray == false) {
      minimizeToTray.checked = false;
    }
  }

  setMinimizeOnClose(settings) {
    var minimizeOnClose = document.getElementById("minimizeOnClose");

    if (settings.minimizeOnClose === undefined) {
      minimizeOnClose.checked = false;
    }
    if (settings.minimizeOnClose == true) {
      minimizeOnClose.checked = true;
    }
    if (settings.minimizeOnClose == false) {
      minimizeOnClose.checked = false;
    }
  }

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
  // TODO: Finish this method.
  // setDefaultUnitAmount(settings) {
  //   var defaultUnitAmount = document.getElementById("defaultUnitAmount");

  //   if (settings.defaultUnitAmount === undefined) {
  //     defaultUnitAmount.value = "NXS";
  //   } else {
  //     defaultUnitAmount.value = settings.defaultUnitAmount;
  //   }
  // }

  setDeveloperMode(settings) {
    var devmode = document.getElementById("devmode");

    if (settings.devMode == true) {
      devmode.checked = true;
    }
  }

  setInfoPopup(settings) {
    var infopop = document.getElementById("infoPopUps");

    if (settings.infopopups == true || settings.infopopups) {
      infopop.checked = true;
    }
  }

  setSavedTxFee(settings) {
    let settxobj = document.getElementById("optionalTransactionFee");
    settxobj.value = this.props.paytxfee;
  }

  updateBackupLocation(event) {
    var el = event.target;
    var settings = require("../../api/settings.js");
    var settingsObj = settings.GetSettings();

    let incomingPath = el.files[0].path;

    settingsObj.backupLocation = incomingPath;

    settings.SaveSettings(settingsObj);
  }

  updateInfoPopUp(event) {
    var el = event.target;
    var settings = require("../../api/settings.js");
    var settingsObj = settings.GetSettings();

    settingsObj.infopopups = el.checked;

    settings.SaveSettings(settingsObj);
  }

  updateAutoStart(event) {
    var el = event.target;
    var settings = require("../../api/settings.js");
    var settingsObj = settings.GetSettings();

    settingsObj.autostart = el.checked;

    settings.SaveSettings(settingsObj);

    //This is the code that will create a reg to have the OS auto start the app
    var AutoLaunch = require("auto-launch");
    // Change Name when we need to
    var autolaunchsettings = new AutoLaunch({
      name: "nexus-tritium-beta",
      path: path.dirname(app.getPath("exe"))
    });
    //No need for a path as it will be set automaticly

    //Check selector
    if (el.checked == true) {
      autolaunchsettings.enable();
      autolaunchsettings
        .isEnabled()
        .then(function(isEnabled) {
          if (isEnabled) {
            return;
          }
          autolaunchsettings.enable();
        })
        .catch(function(err) {
          // handle error
        });
    } else {
      // Will Remove the property that makes it auto play
      autolaunchsettings.disable();
    }
  }

  updateMinimizeToTray(event) {
    var el = event.target;
    var settings = require("../../api/settings.js");
    var settingsObj = settings.GetSettings();

    settingsObj.minimizeToTray = el.checked;

    settings.SaveSettings(settingsObj);
  }

  updateMinimizeOnClose(event) {
    var el = event.target;
    var settings = require("../../api/settings.js");
    var settingsObj = settings.GetSettings();

    settingsObj.minimizeOnClose = el.checked;

    settings.SaveSettings(settingsObj);
  }

  updateGoogleAnalytics(event) {
    var el = event.target;
    var settings = require("../../api/settings.js");
    var settingsObj = settings.GetSettings();

    settingsObj.googleAnalytics = el.checked;

    if (el.checked == true) {
      this.props.googleanalytics.EnableAnalytics();

      this.props.googleanalytics.SendEvent(
        "Settings",
        "Analytics",
        "Enabled",
        1
      );
    } else {
      this.props.googleanalytics.SendEvent(
        "Settings",
        "Analytics",
        "Disabled",
        1
      );
      this.props.googleanalytics.DisableAnalytics();
    }

    settings.SaveSettings(settingsObj);
  }

  updateOptionalTransactionFee(event) {
    var el = event.target;
    var settings = require("../../api/settings.js");
    var settingsObj = settings.GetSettings();
    settingsObj.optionalTransactionFee = el.value;

    settings.SaveSettings(settingsObj);
  }

  setTxFee() {
    let TxFee = document.getElementById("optionalTransactionFee").value;
    if (parseFloat(TxFee) > 0) {
      RPC.PROMISE("settxfee", [parseFloat(TxFee)]);
      this.props.OpenModal("Transaction Fee Set");
      setTimeout(() => this.props.CloseModal(), 3000);
    } else {
      this.props.OpenModal("Invalid Transaction Fee");
      setTimeout(() => this.props.CloseModal(), 3000);
    }
  }

  updateDefaultUnitAmount(event) {
    var el = event.target;
    var settings = require("../../api/settings.js");
    var settingsObj = settings.GetSettings();

    settingsObj.defaultUnitAmount = el.options[el.selectedIndex].value;

    settings.SaveSettings(settingsObj);
  }

  updateDeveloperMode(event) {
    var el = event.target;
    var settings = require("../../api/settings.js");
    var settingsObj = settings.GetSettings();

    settingsObj.devMode = el.checked;

    settings.SaveSettings(settingsObj);
  }

  returnCurrentBackupLocation() {
    let currentLocation = require("../../api/settings.js").GetSettings();
    //set state for currentlocation and return it

    return "Current Location: " + currentLocation.backupLocation;
  }

  saveEmail() {
    var settings = require("../../api/settings.js");
    var settingsObj = settings.GetSettings();
    let emailFeild = document.getElementById("emailAddress");
    let emailregex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (emailregex.test(emailFeild.value)) {
      settingsObj.email = emailFeild.value;
      settings.SaveSettings(settingsObj);
    } else alert("Invalid Email");
  }

  backupWallet(e) {
    e.preventDefault();
    let now = new Date()
      .toString()
      .slice(0, 24)
      .split(" ")
      .reduce((a, b) => {return a + "_" + b;})
      .replace(/:/g, "_");

    let BackupDir = process.env.HOME + "/NexusBackups";
    if (process.platform === "win32") {
      BackupDir = BackupDir.replace(/\\/g, "/");
    }
    let fs = require("fs");
    let ifBackupDirExists = fs.existsSync(BackupDir);
    if (ifBackupDirExists == undefined || ifBackupDirExists == false) {
      fs.mkdirSync(BackupDir);
    }

    RPC.PROMISE("backupwallet", [
      BackupDir + "/NexusBackup_" + now + ".dat"
    ]).then(payload => {
      this.props.OpenModal("Wallet Backup");
      setTimeout(() => this.props.CloseModal(), 3000);
    });
  }

  OnFiatCurrencyChange(e) {
    this.props.setFiatCurrency(e.target.value);
    let settings = require("../../api/settings.js").GetSettings();
    settings.fiatCurrency = e.target.value;
    this.props.setSettings(settings);
    require("../../api/settings.js").SaveSettings(settings);
  }

  // Mandatory React method
  render() {
    var settings = require("../../api/settings.js");
    var settingsObj = settings.GetSettings();
    return (
      <section id="application">
        <Modal
          center
          classNames={{ modal: "custom-modal2" }}
          showCloseIcon={false}
          open={this.props.openSecondModal}
          onClose={this.props.CloseModal2}
        >
          <div>
            {" "}
            <h2>Set (New) Transaction Fee?</h2>
            <input
              value="Yes"
              type="button"
              className="button primary"
              onClick={() => {
                this.setTxFee();
                this.props.CloseModal2();
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
            <label htmlFor="autostart">Start at system startup</label>
            <input
              id="autostart"
              type="checkbox"
              className="switch"
              onChange={this.updateAutoStart}
              data-tooltip="Automatically start the wallet when you log into your system"
            />
          </div>

          <div className="field">
            <label htmlFor="minimizeToTray">Minimize to tray</label>
            <input
              id="minimizeToTray"
              type="checkbox"
              className="switch"
              onChange={this.updateMinimizeToTray}
              data-tooltip="Minimize the wallet to the system tray"
            />
          </div>

          <div className="field">
            <label htmlFor="minimizeOnClose">Minimize on close</label>
            <input
              id="minimizeOnClose"
              type="checkbox"
              className="switch"
              onChange={this.updateMinimizeOnClose}
              data-tooltip="Minimize the wallet when closing the window instead of closing it"
            />
          </div>

          <div className="field">
            <label htmlFor="infoPopUps">Information Popups</label>
            <input
              id="infoPopUps"
              type="checkbox"
              className="switch"
              onChange={this.updateInfoPopUp}
              data-tooltip="Show Informational Popups"
            />
          </div>

          <div className="field">
            <label htmlFor="googleAnalytics">Send anonymous usage data</label>
            <input
              id="googleAnalytics"
              type="checkbox"
              className="switch"
              onChange={this.updateGoogleAnalytics.bind(this)}
              data-tooltip="Send anonymous usage data to allow the Nexus developers to improve the wallet"
            />
          </div>

          <div className="field">
            <label htmlFor="fiatDefualt"> Fiat Currency </label>
            <select
              ref="fiatSelector"
              value={this.props.settings.fiatCurrency}
              onChange={e => this.OnFiatCurrencyChange(e)}
            >
              <option key="AUD" value="AUD">
                Australian Dollar
              </option>
              <option key="BRL" value="BRL">
                Brazilian Real
              </option>
              <option key="GPB" value="GPB">
                British Pound
              </option>
              <option key="CAD" value="CAD">
                Canadian Dollar
              </option>
              <option key="CLP" value="CLP">
                Chilean Peso
              </option>
              <option key="CNY" value="CNY">
                Chinese Yuan
              </option>
              <option key="CZK" value="CZK">
                Czeck Koruna
              </option>
              <option key="EUR" value="EUR">
                Euro
              </option>
              <option key="HKD" value="HKD">
                Hong Kong Dollar
              </option>
              <option key="INR" value="INR">
                Israeli Shekel
              </option>
              <option key="JPY" value="JPY">
                Japanese Yen
              </option>
              <option key="KRW" value="KRW">
                Korean Won
              </option>
              <option key="MYR" value="MYR">
                Malaysian Ringgit
              </option>
              <option key="MXN" value="MXN">
                Mexican Peso
              </option>
              <option key="NZD" value="NZD">
                New Zealand Dollar
              </option>
              <option key="PKR" value="PKR">
                Pakistan Rupee
              </option>
              <option key="RUB" value="RUB">
                Russian Ruble
              </option>
              <option key="SAR" value="SAR">
                Saudi Riyal
              </option>
              <option key="SGD" value="SGD">
                Singapore Dollar
              </option>
              <option key="ZAR" value="ZAR">
                South African Rand
              </option>
              <option key="CHF" value="CHF">
                Swiss Franc
              </option>
              <option key="TWD" value="TWD">
                Taiwan Dollar
              </option>
              <option key="AED" value="AED">
                United Arab Emirates Dirham
              </option>
              <option key="USD" value="USD">
                United States Dollar
              </option>
            </select>
          </div>

          {/* NEXUS FEE */}
          <div className="field">
            <label htmlFor="optionalTransactionFee">
              Optional transaction fee (in NXS)
            </label>{" "}
            <div className="fee">
              <input
                className="Txfee"
                id="optionalTransactionFee"
                type="number"
                step="0.01"
                min="0"
                data-tooltip="Optional transaction fee to include on transactions. Higher amounts will allow transactions to be processed faster, lower may cause additional transaction processing"
              />
              <button
                className="feebutton"
                onClick={e => {
                  e.preventDefault();
                  this.props.OpenModal2();
                }}
              >
                Set
              </button>
            </div>
          </div>
          {/* <div className="field">
            <label htmlFor="defaultUnitAmount">Default unit amount</label>
            <select
              id="defaultUnitAmount"
              onChange={this.updateDefaultUnitAmount}
              data-tooltip="Default unit amount to display throughout the wallet"
            >
              <option value="NXS">NXS</option>
              <option value="mNXS">mNXS</option>
              <option value="uNXS">uNXS</option>
            </select>
          </div> */}

          <div className="field">
            <label htmlFor="devmode">Developer Mode</label>
            <input
              id="devmode"
              type="checkbox"
              className="switch"
              onChange={this.updateDeveloperMode}
              data-tooltip="Development mode enables advanced features to aid in development. After enabling the wallet must be closed and reopened to enable those features"
            />
          </div>

          {/* <div className="field">
            <label htmlFor="emailAddress">Email Address</label>
            <input
              id="emailAddress"
              type="email"
              placeholder={settingsObj.email || ""}
              data-tooltip="Email address for email reciepts."
            />
            <button
              className="button primary"
              id="noPad"
              onClick={() => this.saveEmail()}
            >
              Save
            </button>
          </div> */}
          <div>
            <button
              className="button primary"
              onClick={e => this.backupWallet(e)}
            >
              Backup wallet
            </button>
          </div>
          <div className="clear-both" />
        </form>
      </section>
    );
  }
}

// Mandatory React-Redux method
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SettingsApp);
