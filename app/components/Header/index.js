// External Dependencies
import React, { Component } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import electron from "electron";
import Modal from "react-responsive-modal";
import CustomProperties from "react-custom-properties";

// Internal Dependencies
import MenuBuilder from "../../menu";
import styles from "./style.css";
import * as RPC from "../../script/rpc";
import * as TYPE from "../../actions/actiontypes";
import * as actionsCreators from "../../actions/headerActionCreators";
import { GetSettings } from "../../api/settings.js";
import GOOGLE from "../../script/googleanalytics";
import configuration from "../../api/configuration";

// Images
import lockedImg from "images/lock-encrypted.svg";
import unencryptedImg from "images/lock-unencrypted.svg";
import unlockImg from "images/lock-minting.svg";
import statGood from "images/status-good.svg";
import statBad from "images/sync.svg";
import stakeImg from "images/staking.svg";
import logoFull from "images/logo-full-beta.svg";

var tray = tray || null;
let mainWindow = electron.remote.getCurrentWindow();
var checkportinterval; // shouldbemoved

// React-Redux mandatory methods
const mapStateToProps = state => {
  return {
    ...state.overview,
    ...state.common,
    ...state.settings
  };
};
const mapDispatchToProps = dispatch =>
  bindActionCreators(actionsCreators, dispatch);

class Header extends Component {
  testDownload() {
    var remote = require("remote-file-size");
    let us = this;
    us.total = 0;
    us.requestTotal = remote(
      "https://nexusearth.com/bootstrap/LLD-Database/recent.zip",
      function(err, o) {
        us.total = o;
      }
    );
    const fs = require("fs");
    const download = require("download");
    let recentDBDuplexStream = download(
      "https://nexusearth.com/bootstrap/LLD-Database/recent.zip",
      { extract: true }
    );
    let thing = 0;
    recentDBDuplexStream.on("data", data => {
      console.log((otherthing.bytesWritten / us.total) * 100);
    });
    recentDBDuplexStream.pipe(
      fs.createWriteStream(configuration.GetAppDataDirectory() + "/recentDB")
    );
    // setInterval(() => {
    //   console.log(
    //     "<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>"
    //   );
    // }, 1000);
  }

  // React Method (Life cycle hook) https://nexusearth.com/bootstrap/LLD-Database/recent.zip
  componentDidMount() {
    this.props.setSettings(GetSettings());
    const menuBuilder = new MenuBuilder(electron.remote.getCurrentWindow().id);
    var self = this;
    this.props.SetGoogleAnalytics(GOOGLE);
    let encryptionStatus = false;
    if (this.props.unlocked_until !== undefined) {
      encryptionStatus = true;
    }
    console.log(configuration.GetAppResourceDir());
    this.props.SetMarketAveData();
    this.props.LoadAddressBook();

    menuBuilder.buildMenu(self);
    this.loadMyAccounts();
    if (tray === null) this.setupTray();

    this.props.GetInfoDump();

    self.set = setInterval(function() {
      self.props.AddRPCCall("getInfo");
      self.props.GetInfoDump();
    }, 20000);

    self.mktData = setInterval(function() {
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

              if (index === -1) {
                accountsList.push({
                  account: e.account,
                  addresses: [e.address]
                });
              } else {
                accountsList[index].addresses.push(e.address);
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
    console.log(electron.remote.getCurrentWindow());
    const path = require("path");
    if (process.env.NODE_ENV === "development") {
      if (process.platform == "darwin") {
        trayImage = path.join(
          configuration.GetAppDataDirectory(),
          "tray",
          "Nexus_Tray_Icon_Template_16.png"
        );
      } else {
        trayImage = path.join(
          configuration.GetAppDataDirectory(),
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
    // tray.setToolTip("the nexus interface");
    if (process.env.NODE_ENV === "development") {
      if (process.platform == "darwin") {
        tray.setPressedImage(
          path.join(
            configuration.GetAppDataDirectory(),
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
        label: "Quit Nexus and Keep Daemon",
        click: function() {
          var keepDaemon = true;
          app.isQuiting = true;
          mainWindow.close();
        }
      },
      {
        label: "Quit Nexus",
        click: function() {
          let settings = require("../../api/settings").GetSettings();
          if (settings.manualDaemon == false) {
            RPC.PROMISE("stop", []).then(payload => {
              setTimeout(() => {
                remote.getCurrentWindow().close();
              }, 1000);
            });
          } else {
            mainWindow.close();
          }
        }
      }
    ]);

    tray.setContextMenu(contextMenu);
  }

  signInStatus() {
    if (this.props.unlocked_until === undefined) {
      return unencryptedImg;
    } else if (this.props.unlocked_until === 0) {
      return lockedImg;
    } else if (this.props.unlocked_until >= 0) {
      return unlockImg;
    }
  }

  signInStatusMessage() {
    let unlockDate = new Date(this.props.unlocked_until * 1000).toLocaleString(
      "en",
      { weekday: "long", year: "numeric", month: "long", day: "numeric" }
    );

    if (this.props.unlocked_until === undefined) {
      return "Wallet Unencrypted";
    } else if (this.props.unlocked_until === 0) {
      return "Wallet Locked";
    } else if (this.props.unlocked_until >= 0) {
      if (this.props.minting_only) {
        return "Unlocked until: " + unlockDate + " STAKING ONLY";
      } else {
        return "Unlocked until: " + unlockDate;
      }
    }
  }

  syncStatus() {
    let syncStatus = document.getElementById("syncStatus");
    if (this.props.heighestPeerBlock > this.props.blocks) {
      // rotates
      syncStatus.classList.remove("sync-img");
      return statBad;
    } else {
      // doesn't
      return statGood;
    }
  }

  returnSyncStatusTooltip() {
    if (this.props.heighestPeerBlock > this.props.blocks) {
      return (
        "Syncing...\nBehind\n" +
        (this.props.heighestPeerBlock - this.props.blocks).toString() +
        "\nBlocks"
      );
    } else {
      return "Synced";
    }
  }

  modalinternal() {
    switch (this.props.modaltype) {
      case "receive":
        return <h2>Transaction Received</h2>;
        break;
      case "send":
        return <h2>Transaction Sent</h2>;
        break;
      case "genesis":
        return <h2>Genesis Transaction</h2>;
        break;
      case "trust":
        return <h2>Trust Transaction</h2>;
        break;
      case "This is an address regiestered to this wallet":
        return <h2>This is an address regiestered to this wallet</h2>;
        break;
      case "Invalid Address":
        return <h2>Invalid Address</h2>;
        break;
      case "Address Added":
        return <h2>Address Added</h2>;
        break;
      case "No Addresses":
        return <h2>No Addresses</h2>;
        break;
      case "Empty Queue!":
        return <h2>Queue Empty</h2>;
        break;
      case "Password has been changed.":
        return <h2>Password has been changed.</h2>;
        break;
      case "Wallet has been encrypted":
        return <h2>Wallet has been encrypted</h2>;
        break;
      case "Settings saved":
        return <h2>Settings saved</h2>;
        break;
      case "Transaction Fee Set":
        return <h2>Transaction Fee Set</h2>;
        break;
      case "Wallet Locked":
        return <h2>Wallet Locked</h2>;
        break;
      case "Wallet Backup":
        return <h2>Wallet Backed Up</h2>;
        break;
      case "Invalid Transaction Fee":
        return <h2>Invalid Transaction Fee</h2>;
        break;
      case "Copied":
        return <h2>Copied</h2>;
        break;
      case "Style Settings Saved":
        return <h2>Style Settings Saved</h2>;
        break;
      case "No ammount set":
        return <h2>No Ammount Set</h2>;
        break;
      case "Please Fill Out Field":
        return <h2>Please Fill Out Field</h2>;
        break;
      case "FutureDate":
        return (
          <h2>
            Unlock until date/time must be at least an hour in the future.
          </h2>
        );
        break;
      case "Incorrect Passsword":
        return <h2>Incorrect Passsword</h2>;
        break;
      case "Core Settings Saved":
        return <h2>Core Settings Saved</h2>;
        break;
      case "Contacts Exported":
        return <h2>Contacts Exported</h2>;
        break;
      default:
        "";
        break;
    }
  }
  daemonStatus() {
    // switch ("DAEMON_STATUS_FUNCTION_CALL_HERE") {
    //   case "starting":
    //     return <span>Daemon is starting...</span>;
    //     break;
    //   case "error":
    //     return <span>Daemon error, please contact support.</span>;
    //     break;
    //   case "loaded":
    //     return null;
    //     break;
    //   default:
    //     return null;
    //     break;
    // }
    if (
      this.props.settings.manualDaemon === false &&
      this.props.connections === undefined
    ) {
      return <span>Loading Daemon. Please wait...</span>;
    } else {
      return null;
    }
  }
  // Mandatory React method
  render() {
    return (
      <div id="Header">
        <button onClick={() => this.testDownload()}>test download</button>
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
        >
          {this.modalinternal()}
        </Modal>

        <div id="settings-menu" className="animated rotateInDownRight ">
          <div className="icon">
            <img src={this.signInStatus()} />
            <div className="tooltip bottom">
              <div>{this.signInStatusMessage()}</div>
            </div>
          </div>
          <div className="icon">
            <img src={stakeImg} />
            <div className="tooltip bottom">
              <div>Stake Weight: {this.props.stakeweight}%</div>
              <div>Interest Rate: {this.props.interestweight}%</div>
              <div>Trust Weight: {this.props.trustweight}%</div>
              <div>Block Weight: {this.props.blockweight}</div>
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
            className="animated zoomIn "
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
