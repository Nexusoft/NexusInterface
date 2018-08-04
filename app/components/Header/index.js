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

import GOOGLE from "../../script/googleanalytics";

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

    console.log(GOOGLE);
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
      return "images/unencryptedicon.png";
    } else if (this.props.unlocked_until === 0) {
      return "images/lock.png";
    } else if (this.props.unlocked_until >= 0) {
      return "images/unlock.png";
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
    let heighestPeerBlock = "";
    RPC.PROMISE("getpeerinfo", []).then(peerresponse => {
      peerresponse.forEach(element => {
        if (element.height >= heighestPeerBlock) {
          heighestPeerBlock = element.height;
        }
      });
    });
    if (heighestPeerBlock > this.props.blocks) {
      return "images/notsynced.png";
    } else {
      return "images/status-good.png";
    }
  }

  render() {
    return (
      <div id="Header">
        <div id="settings-menu">
          <div className="icon">
            <img src={this.signInStatus()} />
            <div className="tooltip bottom">
              <div>{this.signInStatusMessage()}</div>
            </div>
          </div>
          <div className="icon">
            <img src="images/nxs-staking-icon.png" />
            <div className="tooltip bottom">
              <div>Stake Weight: {this.props.stakeweight}%</div>
              <div>Interest Rate: {this.props.interestweight}%</div>
              <div>Trust Weight: {this.props.trustweight}%</div>
              <div>Block Weight: {this.props.blockweight}</div>
            </div>
          </div>
          <div className="icon">
            <img src={this.syncStatus()} />
            {/* <div className="tooltip" /> */}
          </div>
        </div>
        <Link to="/">
          <img id="logo" src="images/NXS-logo-min.png" alt="Nexus Logo" />
        </Link>

        <div id="hdr-line" />
      </div>
    );
  }
}
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Header);
