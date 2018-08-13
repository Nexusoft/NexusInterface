import React, { Component } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import electron from "electron";
import MenuBuilder from "../../menu";

import styles from "./style.css";
import * as RPC from "../../script/rpc";
import * as TYPE from "../../actions/actiontypes";
import * as actionsCreators from "../../actions/headerActionCreators";

import lockedImg from "images/lock-encrypted.svg";
import unencryptedImg from "images/lock-unencrypted.svg";
import unlockImg from "images/lock-minting.svg";
import GOOGLE from "../../script/googleanalytics";
let heighestPeerBlock = 0;

const mapStateToProps = state => {
  // console.log(state.overview);

  return { ...state.overview, ...state.common };
};

const mapDispatchToProps = dispatch =>
  bindActionCreators(actionsCreators, dispatch);

class Header extends Component {
  componentDidMount() {
    const menuBuilder = new MenuBuilder(
      require("electron").remote.getCurrentWindow().id
    );

    //console.log(visitor);
    this.props.SetGoogleAnalytics(GOOGLE);
    menuBuilder.buildMenu(this.props.history);

    this.props.GetInfoDump();

    var self = this;
    self.set = setInterval(function() {
      self.props.GetInfoDump();
    }, 1000);
    this.props.history.push("/");
  }
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
      return "Unlocked until: " + unlockDate;
    }
  }

  syncStatus() {
    RPC.PROMISE("getpeerinfo", []).then(peerresponse => {
      peerresponse.forEach(element => {
        if (element.height >= heighestPeerBlock) {
          heighestPeerBlock = element.height;
        }
      });
    });
    if (heighestPeerBlock > this.props.blocks) {
      return "images/status-bad.svg";
    } else {
      return "images/status-good.svg";
    }
  }

  returnSyncStatusTooltip() {
    if (heighestPeerBlock > this.props.blocks) {
      return (
        "Syncing...\nBehind\n" +
        (heighestPeerBlock - this.props.blocks).toString() +
        "\nBlocks"
      );
    } else {
      return "Synced";
    }
  }

  render() {
    return (
      <div id="Header">
        <div id="settings-menu" className="animated rotateInDownRight ">
          <div className="icon">
            <img src={this.signInStatus()} />
            <div className="tooltip bottom">
              <div>{this.signInStatusMessage()}</div>
            </div>
          </div>
          <div className="icon">
            <img src="images/staking.svg" />
            <div className="tooltip bottom">
              <div>Stake Weight: {this.props.stakeweight}%</div>
              <div>Interest Rate: {this.props.interestweight}%</div>
              <div>Trust Weight: {this.props.trustweight}%</div>
              <div>Block Weight: {this.props.blockweight}</div>
            </div>
          </div>
          <div className="icon">
            <img src={this.syncStatus()} />
            <div className="tooltip bottom" style={{ right: "100%" }}>
              <div>{this.returnSyncStatusTooltip()}</div>
            </div>
          </div>
        </div>
        <Link to="/">
          <img
            id="logo"
            className="animated zoomIn "
            src="images/logo-full-beta.svg"
            alt="Nexus Logo"
          />
        </Link>

        <div id="hdr-line" className="animated fadeIn " />
      </div>
    );
  }
}
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Header);
