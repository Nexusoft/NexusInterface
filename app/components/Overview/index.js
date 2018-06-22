import React, { Component } from "react";
import { Link } from "react-router-dom";
import styles from "./style.css";
import { connect } from "react-redux";

// importing images here because of a weird webpack issue
import Connections0 from "../../images/Connections0.png";
import Connections4 from "../../images/Connections4.png";
import Connections8 from "../../images/Connections8.png";
import Connections12 from "../../images/Connections12.png";
import Connections14 from "../../images/Connections14.png";
import Connections16 from "../../images/Connections16.png";

import blockweight0 from "../../images/BlockWeight-0.png";
import blockweight1 from "../../images/BlockWeight-1.png";
import blockweight2 from "../../images/BlockWeight-2.png";
import blockweight3 from "../../images/BlockWeight-3.png";
import blockweight4 from "../../images/BlockWeight-4.png";
import blockweight5 from "../../images/BlockWeight-5.png";
import blockweight6 from "../../images/BlockWeight-6.png";
import blockweight7 from "../../images/BlockWeight-7.png";
import blockweight8 from "../../images/BlockWeight-8.png";
import blockweight9 from "../../images/BlockWeight-9.png";

import trust00 from "../../images/trust00.png";
import trust10 from "../../images/trust10.png";
import trust20 from "../../images/trust20.png";
import trust30 from "../../images/trust30.png";
import trust40 from "../../images/trust40.png";
import trust50 from "../../images/trust50.png";
import trust60 from "../../images/trust60.png";
import trust70 from "../../images/trust70.png";
import trust80 from "../../images/trust80.png";
import trust90 from "../../images/trust90.png";
import trust100 from "../../images/trust100.png";

import nxsStake from "../../images/nxs-staking.png";
import interestRate from "../../images/nxs-chart.png";
import nxsblocks from "../../images/nxs-blocks.png";

import NetworkGlobe from "./NetworkGlobe";

const mapStateToProps = state => {
  return {
    ...state.common
  };
};

const mapDispatchToProps = dispatch => ({});

class Overview extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    const yesArray = [];
    for (let prop in this.props) {
      if (this.props[prop] === nextProps[prop]) {
        yesArray.push(true);
      }
    }
    if (yesArray.length === Object.keys(this.props).length - 1) {
      return false;
    } else {
      return true;
    }
  }

  connectionsImage() {
    const con = this.props.connections;
    console.log("shit rerendering ");
    if (con <= 4) {
      return Connections0;
    } else if (con > 4 && con <= 8) {
      return Connections4;
    } else if (con > 8 && con <= 12) {
      return Connections8;
    } else if (con > 12 && con <= 14) {
      return Connections12;
    } else if (con > 14 && con <= 16) {
      return Connections14;
    } else if (con > 16) {
      return Connections16;
    } else {
      return Connections0;
    }
  }

  trustImg() {
    const TW = parseInt(this.props.trustweight / 10);
    switch (TW) {
      case 0:
        return trust00;
        break;
      case 1:
        return trust10;
        break;
      case 2:
        return trust20;
        break;
      case 3:
        return trust30;
        break;
      case 4:
        return trust40;
        break;
      case 5:
        return trust50;
        break;
      case 6:
        return trust60;
        break;
      case 7:
        return trust70;
        break;
      case 8:
        return trust80;
        break;
      case 9:
        return trust90;
        break;
      case 10:
        return trust100;
        break;
      default:
        return trust00;
        break;
    }
  }

  blockWeightImage() {
    const BW = parseInt(this.props.blockweight / 10);
    switch (BW) {
      case 0:
        return blockweight0;
        break;
      case 1:
        return blockweight1;
        break;
      case 2:
        return blockweight2;
        break;
      case 3:
        return blockweight3;
        break;
      case 4:
        return blockweight4;
        break;
      case 5:
        return blockweight5;
        break;
      case 6:
        return blockweight6;
        break;
      case 7:
        return blockweight7;
        break;
      case 8:
        return blockweight8;
        break;
      case 9:
        return blockweight9;
        break;
      default:
        return blockweight0;
        break;
    }
  }

  render() {
    return (
      <div id="overviewPage">
        <div id="left-stats">
          <div className="grid-container">
            <div className="h2">Balance</div>
            <div className="overviewValue">{this.props.balance}</div>
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
            <div className="overviewValue">{this.props.connections}</div>
          </div>
          <div className="h2">Block Weight</div>
          <div id="nxs-blockweight-info">
            <img
              src={this.blockWeightImage()}
              id="nxs-getinfo-blockweight-image"
            />
            <div className="overviewValue">{this.props.blockweight}</div>
          </div>
          <div className="h2">Block Count</div>
          <div id="nxs-blocks-info">
            <img src={nxsblocks} />
            <div className="overviewValue">{this.props.blocks}</div>
          </div>
          <div className="h2">Trust Weight</div>
          <div id="nxs-trustweight-info">
            <img id="nxs-getinfo-trustweight-image" src={this.trustImg()} />
            <div className="overviewValue">{this.props.trustweight}</div>
          </div>
          <div className="h2">Interest Rate</div>
          <div id="nxs-interestweight-info">
            <img src={interestRate} />
            <div className="overviewValue">
              {this.props.interestweight + "%"}
            </div>
          </div>
          <div className="h2">Stake Weight</div>
          <div id="nxs-stakeweight-info">
            <img src={nxsStake} />
            <div className="overviewValue">{this.props.stakeweight}</div>
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
