import React, { Component } from "react";
import { Link } from "react-router-dom";
import styles from "./style.css";
import * as RPC from "../../script/rpc";
import * as TYPE from "../../actions/actiontypes";
import ContextMenuBuilder from "../../contextmenu";
import { remote } from "electron";
import { access } from "fs";
import Modal from "react-responsive-modal";
import { connect } from "react-redux";

const mapStateToProps = state => {
  return {
    ...state.common,
    ...state.sendRecieve,
    ...state.overview
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
    dispatch({ type: TYPE.GET_SETTINGS, payload: settings })
});

var currentBackupLocation = ""; //Might redo to use redux but this is only used to replace using json reader every render;

class SettingsApp extends Component {
  /// Compent Did Mount
  /// React Lifecycle on page load.
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
  }
  componentWillUnmount() {
    this.props.setSettings(require("../../api/settings.js").GetSettings());
  }
  /// Component Did Update
  /// React Lifecycle hook on when the page is updated
  componentDidUpdate() {
    this.props.setSettings(require("../../api/settings.js").GetSettings());
    // Left over on work in progress for having a select directoy
    //this.refs.backupInputField.webkitdirectory = true;
    //this.refs.backupInputField.directory = true;
    //console.log(this.refs);
  }

  /// Set Autostart
  /// Sets the HTML element toggle for AutoStart
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

  /// Set Minimize To Tray
  /// Sets the HTML element toggle for MinimizeToTray
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

  /// Set Minimize On Close
  /// Sets the HTML element toggle for MinimizeOnClose
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

  /// Set Google Analytics Enabled
  /// Sets the HTML element toggle for GoogleAnalytics
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
  // Set default unit amount
  //

  // setDefaultUnitAmount(settings) {
  //   var defaultUnitAmount = document.getElementById("defaultUnitAmount");

  //   if (settings.defaultUnitAmount === undefined) {
  //     defaultUnitAmount.value = "NXS";
  //   } else {
  //     defaultUnitAmount.value = settings.defaultUnitAmount;
  //   }
  // }

  /// Set Developer Mode
  /// Sets the HTML element toggle for DevMode
  setDeveloperMode(settings) {
    var devmode = document.getElementById("devmode");

    if (settings.devMode == true) {
      devmode.checked = true;
    }
  }

  // Set info popup
  setInfoPopup(settings) {
    var infopop = document.getElementById("infoPopUps");

    if (settings.infopopups == true || settings.infopopups) {
      infopop.checked = true;
    }
  }

  /// Set Saved Tx Fee
  /// Sets the TX fee based on the RPC server
  setSavedTxFee(settings) {
    let settxobj = document.getElementById("optionalTransactionFee");
    settxobj.value = this.props.paytxfee;
    console.log(this.props.paytxfee);
  }

  /// Update Backup Locaton
  /// Update settings so that we have the correct back up location
  updateBackupLocation(event) {
    var el = event.target;
    var settings = require("../../api/settings.js");
    var settingsObj = settings.GetSettings();

    let incomingPath = el.files[0].path;

    console.log(incomingPath);

    settingsObj.backupLocation = incomingPath;

    settings.SaveSettings(settingsObj);
  }

  /// Update info Popups
  /// Update Settings with the users Input
  updateInfoPopUp(event) {
    var el = event.target;
    var settings = require("../../api/settings.js");
    var settingsObj = settings.GetSettings();

    settingsObj.infopopups = el.checked;

    settings.SaveSettings(settingsObj);
  }

  /// Update autostart
  /// Update Settings with the users Input
  updateAutoStart(event) {
    var el = event.target;
    var settings = require("../../api/settings.js");
    var settingsObj = settings.GetSettings();

    settingsObj.autostart = el.checked;

    settings.SaveSettings(settingsObj);

    ///This is the code that will create a reg to have the OS auto start the app
    var AutoLaunch = require("auto-launch");
    /// Change Name when we need to
    var autolaunchsettings = new AutoLaunch({
      name: "nexus-interface"
    });
    ///No need for a path as it will be set automaticly

    ///Check selector
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
      /// Will Remove the property that makes it auto play
      autolaunchsettings.disable();
    }
  }

  /// Update Minimize To Tray
  /// Update Settings with the users Input
  updateMinimizeToTray(event) {
    var el = event.target;
    var settings = require("../../api/settings.js");
    var settingsObj = settings.GetSettings();

    settingsObj.minimizeToTray = el.checked;

    settings.SaveSettings(settingsObj);
  }

  /// Update Minimize On Close
  /// Update Settings with the users Input
  updateMinimizeOnClose(event) {
    var el = event.target;
    var settings = require("../../api/settings.js");
    var settingsObj = settings.GetSettings();

    settingsObj.minimizeOnClose = el.checked;

    settings.SaveSettings(settingsObj);
  }

  /// Update Enabled Google Analytics
  /// Update Settings with the users Input
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

  /// Update Optional Transaction Fee
  /// Update Settings with the users Input
  updateOptionalTransactionFee(event) {
    var el = event.target;
    var settings = require("../../api/settings.js");
    var settingsObj = settings.GetSettings();
    settingsObj.optionalTransactionFee = el.value;

    settings.SaveSettings(settingsObj);
  }

  /// Set TxFee
  /// Sets the transaction fee and sets that using at RPC command to the daemon
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

  /// Update Default Unit Amount
  /// Update Settings with the users Input
  updateDefaultUnitAmount(event) {
    var el = event.target;
    var settings = require("../../api/settings.js");
    var settingsObj = settings.GetSettings();

    settingsObj.defaultUnitAmount = el.options[el.selectedIndex].value;

    settings.SaveSettings(settingsObj);
  }

  /// Update Developer Mode
  /// Update Settings with the users Input
  updateDeveloperMode(event) {
    var el = event.target;
    var settings = require("../../api/settings.js");
    var settingsObj = settings.GetSettings();

    settingsObj.devMode = el.checked;

    settings.SaveSettings(settingsObj);
  }

  /// Return Backup Location
  /// ?? WORK IN PROGRESS ??
  returnCurrentBackupLocation() {
    let currentLocation = require("../../api/settings.js").GetSettings();
    //set state for currentlocation and return it

    return "Current Location: " + currentLocation.backupLocation;
  }

  /// Save Email
  /// Save Email to json file.
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
      .reduce((a, b) => {
        return a + "_" + b;
      });

    let BackupDir = process.env.HOME + "/NexusBackups";
    if (process.platform === "win32") {
      BackupDir = BackupDir.replace(/\\/g, "/");
    }
    let fs = require("fs");
    let ifBackupDirExists = fs.existsSync(BackupDir);
    if (ifBackupDirExists == undefined || ifBackupDirExists == false) {
      fs.mkdirSync(BackupDir);
    }
    console.log(now);
    RPC.PROMISE("backupwallet", [
      BackupDir + "/NexusBackup_" + now + ".dat"
    ]).then(payload => {
      this.props.OpenModal("Wallet Backup");
      setTimeout(() => this.props.CloseModal(), 3000);
    });
  }

  render() {
    var settings = require("../../api/settings.js");
    var settingsObj = settings.GetSettings();
    return (
      <section id="application">
        <Modal
          center
          classNames={{ overlay: "custom-overlay2", modal: "custom-modal2" }}
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
                onClick={() => {
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
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SettingsApp);
