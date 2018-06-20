import React, { Component } from "react";
import { Link } from "react-router-dom";
import styles from "./style.css";
import { connect } from "react-redux";
import { getIn } from "immutable";

import NetworkGlobe from "./NetworkGlobe";

const mapStateToProps = state => {
  return state.toJS();
};

const mapDispatchToProps = dispatch => ({});

class Overview extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    const yesArray = [];
    for (let prop in this.props.common.getinfo) {
      if (this.props.common.getinfo[prop] === nextProps.common.getinfo[prop]) {
        yesArray.push(true);
      }
    }
    if (yesArray.length === Object.keys(this.props.common.getinfo).length - 1) {
      return false;
    } else {
      return true;
    }
  }

  connectionsImage() {
    const con = this.props.common.getinfo.connections;
    console.log(this.props);
    if (con <= 4) {
      return "images/Connections0.png";
    } else if (con > 4 && con <= 8) {
      return "images/Connections4.png";
    } else if (con > 8 && con <= 12) {
      return "images/Connections8.png";
    } else if (con > 12 && con <= 14) {
      return "images/Connections12.png";
    } else if (con > 14 && con <= 16) {
      return "images/Connections14.png";
    } else if (con > 16) {
      return "images/Connections16.png";
    } else {
      return "images/Connections0.png";
    }
  }

  render() {
    return (
      <div id="overviewPage">
        <div id="left-stats">
          <div className="grid-container">
            <div className="h2">Balance</div>
            <div className="overviewValue">
              {this.props.common.getinfo.balance}
            </div>
            <div id="coin">NXS</div>
          </div>
          <div className="grid-container">
            <div className="balance-info">
              <div className="h2">Currency Value</div>
              <div className="overviewValue">$0.00</div>
              <div id="currency">USD</div>
            </div>
          </div>
          <div className="grid-container">
            <div className="balance-info">
              <div className="h2">Transactions</div>
              <div className="overviewValue">0</div>
            </div>
          </div>
          <div className="grid-container">
            <div className="balance-info">
              <div className="h2">Market Price</div>
              <div className="overviewValue">0</div>
            </div>
          </div>
          <div className="grid-container">
            <div className="balance-info">
              <div className="h2">Market Price</div>
              <div className="overviewValue">0</div>
            </div>
          </div>
        </div>
        <NetworkGlobe />
        <div className="right-stats">
          <div className="h2">Connections</div>
          <div id="nxs-connections-info">
            <img
              id="nxs-getinfo-connections-image"
              src={this.connectionsImage()}
            />
            <div className="overviewValue">
              {this.props.common.getinfo.connections}
            </div>
          </div>
          <div className="h2">Block Weight</div>
          <div id="nxs-blockweight-info">
            <img
              id="nxs-getinfo-blockweight-image"
              src="images/BlockWeight-0.png"
            />
            <div className="overviewValue">
              {this.props.common.getinfo.blockweight}
            </div>
          </div>
          <div className="h2">Block Count</div>
          <div id="nxs-blocks-info">
            <img src="images/nxs-blocks.png" />
            <div className="overviewValue">
              {this.props.common.getinfo.blocks}
            </div>
          </div>
          <div className="h2">Trust Weight</div>
          <div id="nxs-trustweight-info">
            <img id="nxs-getinfo-trustweight-image" src="images/trust00.png" />
            <div className="overviewValue">
              {this.props.common.getinfo.trustweight}
            </div>
          </div>
          <div className="h2">Interest Weight</div>
          <div id="nxs-interestweight-info">
            <img src="images/nxs-chart.png" />
            <div className="overviewValue">
              {this.props.common.getinfo.interestweight + "%"}
            </div>
          </div>
          <div className="h2">Stake Weight</div>
          <div id="nxs-stakeweight-info">
            <img src="images/nxs-staking.png" />
            <div className="overviewValue">
              {this.props.common.getinfo.stakeweight}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Overview);
