import React, { Component } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";

import styles from "./style.css";
import * as RPC from "../../script/rpc";
import * as TYPE from "../../actions/actiontypes";

const mapStateToProps = state => {
  return { ...state.common };
};

const mapDispatchToProps = dispatch => ({
  GetInfoDump: returnedData =>
    dispatch({ type: TYPE.GET_INFO_DUMP, payload: returnedData })
});

class Header extends Component {
  componentDidMount() {
    RPC.PROMISE("getinfo", []).then(payload => {
      this.props.GetInfoDump(payload);
    });

    var self = this;
    self.set = setInterval(function() {
      RPC.PROMISE("getinfo", []).then(payload => {
        self.props.GetInfoDump(payload);
      });
    }, 1000);
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
            <div className="tooltip">
              <div>{this.signInStatusMessage()}</div>
            </div>
          </div>
          <div className="icon">
            <img src="images/nxs-staking-icon.png" />
            <div className="tooltip">
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
