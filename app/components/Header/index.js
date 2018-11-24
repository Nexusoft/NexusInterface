// External Dependencies
import React, { Component } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import electron from "electron";
import Modal from "react-responsive-modal";
import CustomProperties from "react-custom-properties";
import log from "electron-log";

// Internal Dependencies
import MenuBuilder from "../../menu";
import styles from "./style.css";
import * as RPC from "../../script/rpc";
import * as TYPE from "../../actions/actiontypes";
import * as actionsCreators from "../../actions/headerActionCreators";
import { GetSettings, SaveSettings } from "../../api/settings";
import GOOGLE from "../../script/googleanalytics";
import configuration from "../../api/configuration";

// Images
import questionmark from "images/questionmark.svg";
import lockedImg from "images/lock-encrypted.svg";
import unencryptedImg from "images/lock-unencrypted.svg";
import unlockImg from "images/lock-minting.svg";
import statGood from "images/status-good.svg";
import statBad from "images/sync.svg";
import stakeImg from "images/staking.svg";
import logoFull from "images/logo-full-beta.svg";
import { write } from "fs";

import { FormattedMessage } from "react-intl";
var tray = tray || null;
let mainWindow = electron.remote.getCurrentWindow();
var checkportinterval; // shouldbemoved

// React-Redux mandatory methods
const mapStateToProps = state => {
  return {
    ...state.overview,
    ...state.common,
    ...state.settings,
    ...state.intl
  };
};
const mapDispatchToProps = dispatch =>
  bindActionCreators(actionsCreators, dispatch);

class Header extends Component {
  // React Method (Life cycle hook)
  componentDidMount() {
    var self = this;

    let settings = GetSettings();

    if (settings === undefined) {
      SaveSettings({ ...this.props.settings, keepDaemon: false });
    } else {
      this.props.setSettings(settings);
    }

    const menuBuilder = new MenuBuilder(electron.remote.getCurrentWindow().id);
    menuBuilder.buildMenu(self);

    this.props.SetGoogleAnalytics(GOOGLE);

    this.props.SetMarketAveData();
    this.props.LoadAddressBook();

    if (tray === null) this.setupTray();

    this.props.GetInfoDump();

    self.set = setInterval(function() {
      self.props.AddRPCCall("getInfo");
      self.props.GetInfoDump();
    }, 20000);
    const core = electron.remote.getGlobal("core");
    core.on("starting", () => {
      self.set = setInterval(function() {
        self.props.AddRPCCall("getInfo");
        self.props.GetInfoDump();
      }, 20000);
    });

    core.on("stopping", () => {
      clearInterval(self.set);
      this.props.clearOverviewVariables();
    });
    this.props.SetMarketAveData();
    self.mktData = setInterval(function() {
      console.log("MARKET");
      self.props.SetMarketAveData();
    }, 900000);

    this.props.history.push("/");
  }
  // React Method (Life cycle hook)
  componentWillReceiveProps(nextProps) {
    if (nextProps.unlocked_until === undefined) {
      this.props.Unlock();
      this.props.Unencrypted();
    } else if (nextProps.unlocked_until === 0) {
      this.props.Lock();
      this.props.Encrypted();
    } else if (nextProps.unlocked_until >= 0) {
      this.props.Unlock();
      this.props.Encrypted();
    }

    if (
      this.props.connections === undefined &&
      nextProps.connections !== undefined
    ) {
      this.loadMyAccounts();
    }

    if (nextProps.blocks !== this.props.blocks) {
      RPC.PROMISE("getpeerinfo", [], this.props)
        .then(peerresponse => {
          let hpb = 0;
          peerresponse.forEach(element => {
            if (element.height >= hpb) {
              hpb = element.height;
            }
          });

          return hpb;
        })
        .then(hpb => {
          this.props.SetHighestPeerBlock(hpb);
        });
    }

    if (this.props.heighestPeerBlock > nextProps.blocks) {
      this.props.SetSyncStatus(false);
    } else {
      this.props.SetSyncStatus(true);
    }

    if (this.props.txtotal < nextProps.txtotal) {
      RPC.PROMISE("listtransactions").then(payload => {
        let MRT = payload.reduce((a, b) => {
          if (a.time > b.time) {
            return a;
          } else {
            return b;
          }
        });

        if (MRT.category === "receive") {
          this.doNotify("Received", MRT.amount + " NXS");
          this.props.OpenModal("receive");
        } else if (MRT.category === "send") {
          this.doNotify("Sent", MRT.amount + " NXS");
          this.props.OpenModal("send");
        } else if (MRT.category === "genesis") {
          this.doNotify("Genesis", MRT.amount + " NXS");
          this.props.OpenModal("genesis");
        } else if (MRT.category === "trust") {
          this.doNotify("Trust", MRT.amount + " NXS");
          this.props.OpenModal("trust");
        }
      });
    } else {
      return null;
    }
  }

  bootstrapModalController() {
    if (
      (this.props.settings.bootstrap && this.props.connections !== undefined) ||
      this.props.BootstrapModal
    ) {
      return true;
    } else return false;
  }

  // Class methods
  loadMyAccounts() {
    RPC.PROMISE("listaccounts", [0]).then(payload => {
      Promise.all(
        Object.keys(payload).map(account =>
          RPC.PROMISE("getaddressesbyaccount", [account])
        )
      ).then(payload => {
        let validateAddressPromises = [];

        payload.map(element => {
          element.addresses.map(address => {
            validateAddressPromises.push(
              RPC.PROMISE("validateaddress", [address])
            );
          });
        });

        Promise.all(validateAddressPromises).then(payload => {
          let accountsList = [];
          let myaccts = payload.map(e => {
            if (e.ismine && e.isvalid) {
              let index = accountsList.findIndex(ele => {
                if (ele.account === e.account) {
                  return ele;
                }
              });
              let indexDefault = accountsList.findIndex(ele => {
                if (ele.account == "" || ele.account == "default") {
                  return ele;
                }
              });

              if (e.account === "" || e.account === "default") {
                if (index === -1 && indexDefault === -1) {
                  accountsList.push({
                    account: "default",
                    addresses: [e.address]
                  });
                } else {
                  accountsList[indexDefault].addresses.push(e.address);
                }
              } else {
                if (index === -1) {
                  accountsList.push({
                    account: e.account,
                    addresses: [e.address]
                  });
                } else {
                  accountsList[index].addresses.push(e.address);
                }
              }
            }
          });
          this.props.MyAccountsList(accountsList);
        });
      });
    });
  }

  doNotify(context, message) {
    Notification.requestPermission().then(result => {
      var myNotification = new Notification(context, {
        body: message
      });
    });
  }

  setupTray() {
    let trayImage = "";
    let mainWindow = electron.remote.getCurrentWindow();

    const path = require("path");
    const app = electron.app || electron.remote.app;

    if (process.env.NODE_ENV === "development") {
      if (process.platform == "darwin") {
        trayImage = path.join(
          __dirname,
          "images",
          "tray",
          "Nexus_Tray_Icon_Template_16.png"
        );
      } else {
        trayImage = path.join(
          __dirname,
          "images",
          "tray",
          "Nexus_Tray_Icon_32.png"
        );
      }
    } else {
      if (process.platform == "darwin") {
        trayImage = path.join(
          configuration.GetAppResourceDir(),
          "images",
          "tray",
          "Nexus_Tray_Icon_Template_16.png"
        );
      } else {
        trayImage = path.join(
          configuration.GetAppResourceDir(),
          "images",
          "tray",
          "Nexus_Tray_Icon_32.png"
        );
      }
    }

    tray = new electron.remote.Tray(trayImage);

    if (process.env.NODE_ENV === "development") {
      if (process.platform == "darwin") {
        tray.setPressedImage(
          path.join(
            __dirname,
            "images",
            "tray",
            "Nexus_Tray_Icon_Highlight_16.png"
          )
        );
      }
    } else {
      tray.setPressedImage(
        path.join(
          configuration.GetAppResourceDir(),
          "images",
          "tray",
          "Nexus_Tray_Icon_Highlight_16.png"
        )
      );
    }
    tray.on("double-click", () => {
      mainWindow.show();
    });

    var contextMenu = electron.remote.Menu.buildFromTemplate([
      {
        label: "Show Nexus",
        click: function() {
          mainWindow.show();
        }
      },
      {
        label: "Close Wallet and Keep Daemon",
        click: function() {
          log.info("header/index.js contextmenu: close and keep");
          let settings = GetSettings();
          settings.keepDaemon = true;
          SaveSettings(settings);
          mainWindow.close();
        }
      },
      {
        label: "Quit Nexus",
        click: function() {
          log.info("header/index.js contextmenu: close and kill");
          let settings = GetSettings();
          settings.keepDaemon = false;
          SaveSettings(settings);
          if (settings.manualDaemon != true) {
            RPC.PROMISE("stop", []).then(payload => {
              setTimeout(() => {
                mainWindow.close();
              }, 1000);
            });
          }
          mainWindow.close();
        }
      }
    ]);

    tray.setContextMenu(contextMenu);
  }

  signInStatus() {
    if (this.props.connections === undefined) {
      return questionmark;
    } else {
      if (this.props.unlocked_until === undefined) {
        return unencryptedImg;
      } else if (this.props.unlocked_until === 0) {
        return lockedImg;
      } else if (this.props.unlocked_until >= 0) {
        return unlockImg;
      }
    }
  }

  signInStatusMessage() {
    let unlockDate = new Date(this.props.unlocked_until * 1000).toLocaleString(
      "en",
      { weekday: "long", year: "numeric", month: "long", day: "numeric" }
    );
    if (this.props.connections === undefined) {
      return (
        <FormattedMessage
          id="Header.DaemonNotLoaded"
          defaultMessage="Daemon Not Loaded"
        />
      );
    }

    if (this.props.unlocked_until === undefined) {
      return (
        <FormattedMessage
          id="Header.WalletUnencrypted"
          defaultMessage="Wallet Unencrypted"
        />
      );
    } else if (this.props.unlocked_until === 0) {
      return (
        <FormattedMessage
          id="Header.UnlockedUntil"
          defaultMessage="Unlocked Until"
        />
      );
    } else if (this.props.unlocked_until >= 0) {
      if (this.props.minting_only) {
        return (
          (
            <FormattedMessage
              id="Header.UnlockedUntil"
              defaultMessage="Unlocked Until"
            />
          ) +
          unlockDate +
          (
            <FormattedMessage
              id="Header.StakingOnly"
              defaultMessage="Staking Only"
            />
          )
        );
      } else {
        return (
          (
            <FormattedMessage
              id="Header.UnlockedUntil"
              defaultMessage="Unlocked Until"
            />
          ) + unlockDate
        );
      }
    }
  }

  syncStatus() {
    let syncStatus = document.getElementById("syncStatus");
    if (
      this.props.connections === undefined ||
      this.props.heighestPeerBlock > this.props.blocks
    ) {
      // rotates
      syncStatus.classList.remove("sync-img");
      return statBad;
    } else {
      // doesn't
      return statGood;
    }
  }

  returnSyncStatusTooltip() {
    if (this.props.connections === undefined) {
      return (
        <FormattedMessage
          id="Header.DaemonNotLoaded"
          defaultMessage="Daemon Not Loaded"
        />
      );
    } else {
      if (this.props.heighestPeerBlock > this.props.blocks) {
        return (
          this.props.messages[this.props.settings.locale]["Header.Synching"] +
          (this.props.heighestPeerBlock - this.props.blocks).toString() +
          this.props.messages[this.props.settings.locale]["Header.Blocks"]
        );
      } else {
        return (
          <FormattedMessage id="Header.Synched" defaultMessage="Synched" />
        );
      }
    }
  }

  modalinternal() {
    switch (this.props.modaltype) {
      case "receive":
        return (
          <h2>
            <FormattedMessage
              id="Alert.Received"
              defaultMessage="Transaction Received"
            />
          </h2>
        );
        break;
      case "send":
        return (
          <h2>
            <FormattedMessage
              id="Alert.Sent"
              defaultMessage="Transaction Sent"
            />
          </h2>
        );
        break;
      case "genesis":
        return (
          <h2>
            <FormattedMessage
              id="Alert.Genesis"
              defaultMessage="Genesis Transaction"
            />
          </h2>
        );
        break;
      case "trust":
        return (
          <h2>
            <FormattedMessage
              id="Alert.TrustTransaction"
              defaultMessage="Trust Transaction"
            />
          </h2>
        );
        break;
      case "This is an address regiestered to this wallet":
        return (
          <h2>
            <FormattedMessage
              id="Alert.regiesteredToThis"
              defaultMessage="This is an address regiestered to this wallet"
            />
          </h2>
        );
        break;
      case "Invalid Address":
        return (
          <h2>
            <FormattedMessage
              id="Alert.InvalidAddress"
              defaultMessage="Invalid Address"
            />
          </h2>
        );
        break;
      case "Invalid":
        return (
          <h2>
            <FormattedMessage id="Alert.Invalid" defaultMessage="Invalid" />
          </h2>
        );
        break;
      case "Address Added":
        return (
          <h2>
            <FormattedMessage
              id="Alert.AddressAdded"
              defaultMessage="Address Added"
            />
          </h2>
        );
        break;
      case "No Addresses":
        return (
          <h2>
            <FormattedMessage
              id="Alert.NoAddresses"
              defaultMessage="No Addresses"
            />
          </h2>
        );
        break;
      case "Empty Queue!":
        return (
          <h2>
            <FormattedMessage
              id="Alert.QueueEmpty"
              defaultMessage="Queue Empty"
            />
          </h2>
        );
        break;
      case "Password has been changed.":
        return (
          <h2>
            <FormattedMessage
              id="Alert.PasswordHasBeenChanged"
              defaultMessage="Password has been changed"
            />
          </h2>
        );
        break;
      case "Wallet has been encrypted":
        return (
          <h2>
            <FormattedMessage
              id="Alert.WalletHasBeenEncrypted"
              defaultMessage="Wallet has been encrypted"
            />
          </h2>
        );
        break;
      case "Settings saved":
        return (
          <h2>
            <FormattedMessage
              id="Alert.SettingsSaved"
              defaultMessage="Settings Saved"
            />
          </h2>
        );
        break;
      case "Transaction Fee Set":
        return (
          <h2>
            <FormattedMessage
              id="Alert.TransactionFeeSet"
              defaultMessage="Transaction Fee Set"
            />
          </h2>
        );
        break;
      case "Wallet Locked":
        return (
          <h2>
            <FormattedMessage
              id="Alert.WalletLocked"
              defaultMessage="Wallet Locked"
            />
          </h2>
        );
        break;
      case "Wallet Backup":
        return (
          <h2>
            <FormattedMessage
              id="Alert.WalletBackedUp"
              defaultMessage="Wallet Backed Up"
            />
          </h2>
        );
        break;
      case "Invalid Transaction Fee":
        return (
          <h2>
            <FormattedMessage
              id="Alert.InvalidTransactionFee"
              defaultMessage="Invalid Transaction Fee"
            />
          </h2>
        );
        break;
      case "Copied":
        return (
          <h2>
            <FormattedMessage id="Alert.Copied" defaultMessage="Copied" />
          </h2>
        );
        break;
      case "Style Settings Saved":
        return (
          <h2>
            <FormattedMessage
              id="Alert.StyleSettingsSaved"
              defaultMessage="Style Settings Saved"
            />
          </h2>
        );
        break;
      case "No ammount set":
        return (
          <h2>
            <FormattedMessage
              id="Alert.NoAmmountSet"
              defaultMessage="No Ammount Set"
            />
          </h2>
        );
        break;
      case "Please Fill Out Field":
        return (
          <h2>
            <FormattedMessage
              id="Alert.PleaseFillOutField"
              defaultMessage="Please Fill Out Field"
            />
          </h2>
        );
        break;
      case "FutureDate":
        return (
          <h2>
            <FormattedMessage
              id="Alert.FutureDate"
              defaultMessage="Unlock until date/time must be at least an hour in the future"
            />
          </h2>
        );
        break;
      case "Incorrect Passsword":
        return (
          <h2>
            <FormattedMessage
              id="Alert.IncorrectPasssword"
              defaultMessage="Incorrect Passsword"
            />
          </h2>
        );
        break;
      case "Core Settings Saved":
        return (
          <h2>
            <FormattedMessage
              id="Alert.CoreSettingsSaved"
              defaultMessage="Core Settings Saved"
            />
          </h2>
        );
        break;
      case "Contacts Exported":
        return (
          <h2>
            <FormattedMessage
              id="Alert.ContactsExported"
              defaultMessage="Contacts Exported"
            />
          </h2>
        );
        break;
      default:
        return <h2>{this.props.modaltype}</h2>;
        break;
    }
  }
  daemonStatus() {
    if (
      this.props.settings.manualDaemon === false &&
      this.props.connections === undefined
    ) {
      return (
        <span>
          <FormattedMessage
            id="Alert.DaemonLoadingWait"
            defaultMessage="Loading Daemon, Please wait..."
          />
          ...
        </span>
      );
    } else {
      return null;
    }
  }

  CloseBootstrapModalAndSaveSettings() {
    this.props.CloseBootstrapModal();
    let settings = GetSettings();
    settings.bootstrap = false;
    SaveSettings(settings);
  }

  BootstrapModalInteriorBuilder() {
    if (this.props.percentDownloaded === 0) {
      return (
        <div>
          <h3>
            <FormattedMessage
              id="ToolTip.DbOption"
              defaultMessage="Would you like to reduce the time it takes to sync by downloading a recent version of the database?"
            />
          </h3>
          <button
            className="button"
            onClick={() => {
              this.props.OpenBootstrapModal(true);
              configuration.BootstrapRecentDatabase(this);
              this.props.setPercentDownloaded(0.001);
            }}
          >
            <FormattedMessage
              id="ToolTip.BootStrapIt"
              defaultMessage="Yes, let's bootstrap it"
            />
          </button>
          <button
            className="button"
            onClick={() => {
              this.CloseBootstrapModalAndSaveSettings();
            }}
          >
            <FormattedMessage
              id="ToolTip.SyncFromScratch"
              defaultMessage="No, let it sync form scratch"
            />
          </button>
        </div>
      );
    } else if (this.props.percentDownloaded < 100) {
      return (
        <div>
          <h3>
            <FormattedMessage
              id="ToolTip.RecentDatabaseDownloading"
              defaultMessage="Recent Database Downloading"
            />
          </h3>
          <div className="progress-bar">
            <div
              className="filler"
              style={{ width: `${this.props.percentDownloaded}%` }}
            />
          </div>
          <h3>
            <FormattedMessage
              id="ToolTip.PleaseWait"
              defaultMessage="Please Wait..."
            />
          </h3>
        </div>
      );
    } else {
      return (
        <div>
          <h3>
            <FormattedMessage
              id="ToolTip.RecentDatabaseExtracting"
              defaultMessage="Recent Database Extracting"
            />
          </h3>

          <h3>
            <FormattedMessage
              id="ToolTip.PleaseWait"
              defaultMessage="Please Wait..."
            />
          </h3>
        </div>
      );
    }
  }

  // Mandatory React method
  render() {
    return (
      <div id="Header">
        <CustomProperties
          global
          properties={{
            "--color-1": this.props.settings.customStyling.MC1,
            "--color-2": this.props.settings.customStyling.MC2,
            "--color-3": this.props.settings.customStyling.MC3,
            "--color-4": this.props.settings.customStyling.MC4,
            "--color-5": this.props.settings.customStyling.MC5,
            "--nxs-logo": this.props.settings.customStyling.NXSlogo,
            "--icon-menu": this.props.settings.customStyling.iconMenu,
            "--footer": this.props.settings.customStyling.footer,
            "--footer-hover": this.props.settings.customStyling.footerHover,
            "--footer-active": this.props.settings.customStyling.footerActive,
            "--background-main-image": `url('${
              this.props.settings.wallpaper
            }')`,
            "--panel-background-color": this.props.settings.customStyling
              .pannelBack,
            "--maxMind-copyright": this.props.settings.customStyling
              .maxMindCopyright
          }}
        />
        <Modal
          showCloseIcon={false}
          center={true}
          open={this.props.open}
          onClose={this.props.CloseModal}
          classNames={{ modal: "custom-modal" }}
          onOpen={() => {
            console.log(this);
          }}
        >
          {this.modalinternal()}
        </Modal>
        <Modal
          key="bootstrap-modal"
          open={this.bootstrapModalController()}
          onClose={() => true}
          center
          focusTrapped={true}
          showCloseIcon={false}
          classNames={{ modal: "modal" }}
        >
          {this.BootstrapModalInteriorBuilder()}
        </Modal>
        <div id="settings-menu" className="animated rotateInDownRight ">
          <div className="icon">
            <img src={this.signInStatus()} />
            <div className="tooltip bottom">
              <div>{this.signInStatusMessage()}</div>
            </div>
          </div>
          {/* wrap this in a check too... */}
          <div className="icon">
            <img src={stakeImg} />

            <div className="tooltip bottom">
              <div>
                <FormattedMessage
                  id="Header.StakeWeight"
                  defaultMessage="Stake Weight"
                />
                : {this.props.stakeweight}%
              </div>
              <div>
                <FormattedMessage
                  id="Header.InterestRate"
                  defaultMessage="Interest Rate"
                />
                : {this.props.interestweight}%
              </div>
              <div>
                <FormattedMessage
                  id="Header.TrustWeight"
                  defaultMessage="Trust Weight"
                />
                : {this.props.trustweight}%
              </div>
              <div>
                <FormattedMessage
                  id="Header.BlockWeight"
                  defaultMessage="Block Weight"
                />
                : {this.props.blockweight}
              </div>
            </div>
          </div>
          <div className="icon">
            {this.props.heighestPeerBlock > this.props.blocks ? (
              <img id="syncing" className="sync-img" src={statBad} />
            ) : (
              <img id="synced" src={statGood} />
            )}
            <div className="tooltip bottom" style={{ right: "100%" }}>
              <div>{this.returnSyncStatusTooltip()}</div>
            </div>
          </div>
        </div>

        <Link to="/">
          <img
            id="logo"
            className="animated zoomIn"
            src={logoFull}
            alt="Nexus Logo"
          />
        </Link>
        <div id="hdr-line" className="animated fadeIn " />
        {this.daemonStatus()}
      </div>
    );
  }
}

// Mandatory React-Redux method
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Header);
