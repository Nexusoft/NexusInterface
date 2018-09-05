import React, { Component } from "react";
import { Link } from "react-router-dom";
import styles from "./style.css";
import { connect } from "react-redux";
import Modal from "react-responsive-modal";
import * as TYPE from "../../actions/actiontypes";

// importing images here because of a weird webpack issue
import USD from "../../images/USD.svg";
import transactionsArrows from "../../images/transactions-arrows.svg";
import marketicon from "../../images/marketstats-white.svg";
import supplyicon from "../../images/supply.svg";
import hours24icon from "../../images/24hr.svg";
import nxsStake from "../../images/nxs-staking.svg";
import interestRate from "../../images/nxs-chart.png";

import Connections0 from "../../images/Connections0.svg";
import Connections4 from "../../images/Connections4.svg";
import Connections8 from "../../images/Connections8.svg";
import Connections12 from "../../images/Connections12.svg";
import Connections14 from "../../images/Connections14.svg";
import Connections16 from "../../images/Connections16.svg";

import blockweight0 from "../../images/BlockWeight-0.svg";
import blockweight1 from "../../images/BlockWeight-1.svg";
import blockweight2 from "../../images/BlockWeight-2.svg";
import blockweight3 from "../../images/BlockWeight-3.svg";
import blockweight4 from "../../images/BlockWeight-4.svg";
import blockweight5 from "../../images/BlockWeight-5.svg";
import blockweight6 from "../../images/BlockWeight-6.svg";
import blockweight7 from "../../images/BlockWeight-7.svg";
import blockweight8 from "../../images/BlockWeight-8.svg";
import blockweight9 from "../../images/BlockWeight-9.svg";

import trust00 from "../../images/trust00.svg";
import trust10 from "../../images/trust00.svg";
import trust20 from "../../images/trust00.svg";
import trust30 from "../../images/trust00.svg";
import trust40 from "../../images/trust00.svg";
import trust50 from "../../images/trust00.svg";
import trust60 from "../../images/trust00.svg";
import trust70 from "../../images/trust00.svg";
import trust80 from "../../images/trust00.svg";
import trust90 from "../../images/trust00.svg";
import trust100 from "../../images/trust00.svg";

import nxsblocks from "../../images/blockexplorer-invert-white.svg";
import interesticon from "../../images/interest.svg";
import stakeicon from "../../images/staking-white.svg";

import NetworkGlobe from "./NetworkGlobe";

import ContextMenuBuilder from "../../contextmenu";
import { remote } from "electron";
import Request from "request";

const mapStateToProps = state => {
  return {
    ...state.overview,
    ...state.common
  };
};

const mapDispatchToProps = dispatch => ({
  setExperimentalWarning: returndata => {
    dispatch({ type: TYPE.SET_EXPERIMENTAL_WARNING, payload: returndata });
  },
  setUSD: rate => dispatch({ type: TYPE.USD_RATE, payload: rate }),
  setSupply: rate => dispatch({ type: TYPE.SET_SUPPLY, payload: rate }),
  set24hrChange: rate => dispatch({ type: TYPE.CHANGE_24, payload: rate }),
  setBTC: rate => dispatch({ type: TYPE.BTC_RATE, payload: rate }),
  BlockDate: stamp => {
    dispatch({ type: TYPE.BLOCK_DATE, payload: stamp });
  }
});

//let experimentalOpen = true;

class Overview extends Component {
  componentDidMount() {
    window.addEventListener("contextmenu", this.setupcontextmenu, false);

    if (this.props.googleanalytics != null) {
      this.props.googleanalytics.SendScreen("Overview");
    }
    Request(
      {
        url: "https://api.coinmarketcap.com/v2/ticker/789/?convert=BTC",
        json: true
      },
      (error, response, body) => {
        if (response.statusCode === 200) {
          this.props.setBTC(body.data.quotes.BTC.price);
          this.props.set24hrChange(body.data.quotes.USD.percent_change_24h);
          this.props.setSupply(body.data.circulating_supply);
          this.props.setUSD(body.data.quotes.USD.price);
        }
      }
    );
  }

  componentWillUnmount() {
    window.removeEventListener("contextmenu", this.setupcontextmenu);
  }

  componentDidUpdate(previousprops) {
    if (this.props.blocks != previousprops.blocks) {
      if (this.props.blocks != 0 && previousprops.blocks != 0) {
        console.log("UPDATE BLOCKS");

        this.redrawCurves();
      }
    }
    if (this.props.blocks > previousprops.blocks) {
      let newDate = new Date();
      this.props.BlockDate(newDate);
    }

    if (this.props.connections != previousprops.connections) {
      if (this.props.connections != 0 && previousprops.connections != 0) {
        console.log("REMOVED OLD BLOCKS AND DID A NEW ONE");
        this.removeOldPoints();
      }
    }
  }

  setupcontextmenu(e) {
    e.preventDefault();
    const contextmenu = new ContextMenuBuilder().defaultContext;
    //build default
    let defaultcontextmenu = remote.Menu.buildFromTemplate(contextmenu);
    defaultcontextmenu.popup(remote.getCurrentWindow());
  }

  calculateUSDvalue() {
    let USDvalue = this.props.balance * this.props.USD;

    if (USDvalue === 0) {
      USDvalue = `${USDvalue}.00`;
    } else {
      USDvalue = USDvalue.toFixed(2);
    }
    return `$${USDvalue}`;
  }

  closeLicenseModal() {
    this.setState({ open: false });
    var settings = require("../../api/settings.js").GetSettings();
    settings.acceptedagreement = true;
    require("../../api/settings.js").SaveSettings(settings);
  }

  returnLicenseModalInternal() {
    let internalString = [];

    internalString.push("MIT LICENSE GOES HERE");
    internalString.push(<br key="br1" />);
    internalString.push(
      <button
        key="agreement-button-accept"
        className="btn btn-action"
        onClick={() => this.closeLicenseModal()}
      >
        ACCEPT
      </button>
    );
    internalString.push(
      <button
        key="agreement-button-reject"
        className="btn btn-action"
        onClick={() => remote.app.quit()}
      >
        REJECT
      </button>
    );

    return internalString;
  }

  returnExperimentalModalInternal() {
    let internalString = [];

    internalString.push(
      "CONSIDER THIS SOFTWARE EXPERIMENTAL. PLEASE BACK UP WALLET FREQUENTLY "
    );
    internalString.push(<br key="br2" />);

    internalString.push(
      <button
        key="experiment-button-accept"
        className="btn btn-action"
        onClick={this.closeExperimentalModal}
      >
        OK
      </button>
    );
    internalString.push(
      <button
        key="experiment-button-noshow"
        className="btn btn-action"
        onClick={() => this.dontShowExperimentalAgain()}
      >
        Don't show this again
      </button>
    );

    return internalString;
  }

  closeExperimentalModal = () => {
    this.props.setExperimentalWarning(false);
    this.forceUpdate();
  };

  dontShowExperimentalAgain() {
    let settings = require("../../api/settings.js").GetSettings();
    settings["experimentalWarning"] = false;
    require("../../api/settings.js").SaveSettings(settings);
    this.props.setExperimentalWarning(false);
    this.forceUpdate();
  }

  connectionsImage() {
    const con = this.props.connections;

    if (con <= 4) {
      return Connections0;
    } else if (con > 4 && con <= 6) {
      return Connections4;
    } else if (con > 6 && con <= 12) {
      return Connections8;
    } else if (con > 12 && con <= 14) {
      return Connections12;
    } else if (con > 14 && con <= 15) {
      return Connections14;
    } else if (con > 15) {
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

  returnIfLicenseShouldBeOpen() {
    let settings = require("../../api/settings.js").GetSettings();
    return !settings.acceptedagreement;
  }

  returnIfExperimentalShouldBeOpen() {
    if (this.returnIfLicenseShouldBeOpen()) {
      return false;
    }
    let settings = require("../../api/settings.js").GetSettings();
    if (this.props.experimentalOpen == true) {
      if (settings.experimentalWarning == null) {
        return true;
      }

      if (settings.experimentalWarning == false) {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }

  returnIfDrawLines() {
    //if (testinglines == true)
  }

  returnIfGlobeEnabled() {
    let settings = require("../../api/settings.js").GetSettings();
    let isglobeopen = settings.renderGlobe;
    if (isglobeopen == false) {
      return null;
    } else {
      return (
        <NetworkGlobe
          handleOnLineRender={e => (this.redrawCurves = e)}
          handleOnRemoveOldPoints={e => (this.removeOldPoints = e)}
        />
      );
    }
  }

  render() {
    const agreementOpen = this.returnIfLicenseShouldBeOpen();
    const experimentalOpenbool = this.returnIfExperimentalShouldBeOpen();
    return (
      <div id="overviewPage">
        <Modal
          key="agreement-modal"
          open={agreementOpen}
          onClose={() => {
            return true;
          }}
          center
          showCloseIcon={false}
          classNames={{ modal: "modal" }}
        >
          <h2>License Agreement</h2>
          {this.returnLicenseModalInternal()}
        </Modal>
        <Modal
          key="experiment-modal"
          open={experimentalOpenbool}
          onClose={this.closeExperimentalModal}
          center
          classNames={{ modal: "modal" }}
        >
          {this.returnExperimentalModalInternal()}
        </Modal>
        <div className="left-stats">
          <div id="nxs-balance-info" className="animated fadeInDown delay-1s">
            <div className="h2">
              Balance <span className="h2-nospace">(NXS)</span>
            </div>
            <img src={nxsStake} />
            <div className="overviewValue">{this.props.balance}</div>
          </div>

          <div
            id="nxs-currency-value-info"
            className="animated fadeInDown delay-1s"
          >
            <div className="h2">
              Currency Value <span className="h2-nospace">(USD)</span>
            </div>
            <img src={USD} />
            <div className="overviewValue">{this.calculateUSDvalue()}</div>
          </div>

          <div
            id="nxs-transactions-info"
            className="animated fadeInDown delay-1s"
          >
            <div className="h2">Transactions</div>
            <img src={transactionsArrows} />
            <div className="overviewValue">{this.props.txtotal}</div>
          </div>

          <div
            id="nxs-market-price-info"
            className="animated fadeInDown delay-1s"
          >
            <div className="h2">
              Market Price <span className="h2-nospace">(BTC)</span>
            </div>
            <img src={marketicon} />
            <div className="overviewValue">{this.props.BTC.toFixed(8)}</div>
          </div>

          <div
            id="nxs-market-price-info"
            className="animated fadeInDown delay-1s"
          >
            <div className="h2">
              Circulating Supply <span className="h2-nospace">(NXS)</span>
            </div>
            <img src={supplyicon} />
            <div className="overviewValue">{this.props.circulatingSupply}</div>
          </div>

          <div
            id="nxs-market-price-info"
            className="animated fadeInDown delay-1s"
          >
            <div className="h2">
              24hr Change <span className="h2-nospace">(USD %)</span>
            </div>
            <img src={hours24icon} />
            <div className="overviewValue">{this.props.USDpercentChange}%</div>
          </div>
        </div>
        {this.returnIfGlobeEnabled()}
        <div className="maxmindCopyright">
          Globe includes GeoLite2 data created by MaxMind <br />
          available at{" "}
          <a href="http://www.maxmind.com">http://www.maxmind.com</a>
        </div>
        <div className="right-stats">
          <div
            id="nxs-connections-info"
            className="animated fadeInDown delay-1s"
          >
            <div className="h2">Connections</div>
            <img
              id="nxs-getinfo-connections-image"
              src={this.connectionsImage()}
            />
            <div className="overviewValue">{this.props.connections}</div>
          </div>
          <div
            id="nxs-blockweight-info"
            className="animated fadeInDown delay-1s"
          >
            <div className="h2">Block Weight</div>
            <img
              src={this.blockWeightImage()}
              id="nxs-getinfo-blockweight-image"
            />
            <div className="overviewValue">{this.props.blockweight}</div>
          </div>
          <div id="nxs-blocks-info" className="animated fadeInDown delay-1s">
            <div className="h2">Block Count</div>
            <img src={nxsblocks} />

            <div className="overviewValue">{this.props.blocks}</div>
            <span className="tooltip left">
              {this.props.blockDate.toLocaleString()}
            </span>
          </div>
          <div
            id="nxs-trustweight-info"
            className="animated fadeInDown delay-1s"
          >
            <div className="h2">Trust Weight</div>
            <img id="nxs-getinfo-trustweight-image" src={this.trustImg()} />
            <div className="overviewValue">{this.props.trustweight}</div>
          </div>
          <div
            id="nxs-interestweight-info"
            className="animated fadeInDown delay-1s"
          >
            <div className="h2">Interest Rate</div>
            <img src={interesticon} />
            <div className="overviewValue">
              {this.props.interestweight + "%"}
            </div>
          </div>
          <div
            id="nxs-stakeweight-info"
            className="animated fadeInDown delay-1s"
          >
            <div className="h2">Stake Weight</div>
            <img src={stakeicon} />
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
