import React, { Component } from "react";
import { Link } from "react-router-dom";
import styles from "./style.css";
import { connect } from "react-redux";
import Modal from 'react-responsive-modal';
import * as TYPE from "../../actions/actiontypes";


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

import ContextMenuBuilder from "../../contextmenu";
import { remote } from "electron";
import Request from "request";

const mapStateToProps = state => {
  return {
    ...state.overview, ...state.common
  };
};

const mapDispatchToProps = dispatch => ({
  setExperimentalWarning: returndata =>
  {
    dispatch({type:TYPE.SET_EXPERIMENTAL_WARNING,payload:returndata})
  },
  setUSD: rate => dispatch({ type: TYPE.USD_RATE, payload: rate }),
  setBTC: rate => dispatch({ type: TYPE.BTC_RATE, payload: rate })
});

//let experimentalOpen = true;

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

  componentDidMount()
  {
    window.addEventListener("contextmenu", this.setupcontextmenu, false);
   
    if ( this.props.googleanalytics != null)
    {
      this.props.googleanalytics.SendScreen("Overview");
    }
    Request(
      {
        url: "https://api.coinmarketcap.com/v2/ticker/789/?convert=BTC",
        json: true
      },
      (error, response, body) => {
        if (response.statusCode === 200) {
          console.log(response);
          this.props.setBTC(body.data.quotes.BTC.price);
          this.props.setUSD(body.data.quotes.USD.price);
        }
      }
    );
  }

  componentWillUnmount() {
    window.removeEventListener("contextmenu", this.setupcontextmenu);
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
    console.log(this.props.BTC);
    if (USDvalue === 0) {
      USDvalue = `${USDvalue}.00`;
    } else {
      USDvalue = USDvalue.toFixed(2);
    }
    return `$${USDvalue}`;
  }

  closeLicenseModal()
  {
    this.setState({ open: false });
    var settings = require("../../api/settings.js").GetSettings();
    settings.acceptedagreement = true;
    require("../../api/settings.js").SaveSettings(settings);
    console.log("accepted");
    
  }

  returnLicenseModalInternal()
  {
    let internalString = [];

      internalString.push("MIT LICENSE GOES HERE");
      internalString.push (<br key="br1" />);
      internalString.push(
        <button key="agreement-button-accept" className="btn btn-action" onClick={ () => this.closeLicenseModal()}>
            ACCEPT
        </button>
      );
      internalString.push(
        <button key="agreement-button-reject" className="btn btn-action" onClick={ () => remote.app.quit()}>
        REJECT
        </button>
      );
   
    return internalString;
  }

  returnExperimentalModalInternal()
  {
    let internalString = [];

    internalString.push ("CONSIDER THIS SOFTWARE EXPERIMENTAL. PLEASE BACK UP WALLET FREQUENTLY ");
    internalString.push(<br key="br2" />);

    internalString.push(
      <button key="experiment-button-accept" className="btn btn-action" onClick={this.closeExperimentalModal}>
          OK
      </button>
    );
    internalString.push(
      <button key="experiment-button-noshow" className="btn btn-action" onClick={ ()  => this.dontShowExperimentalAgain() }>
      Don't show this again
      </button>
    );

    return internalString;
  }

  closeExperimentalModal = () =>
  {
    this.props.setExperimentalWarning(false);
    this.forceUpdate();
  }

  dontShowExperimentalAgain()
  {
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

  returnIfLicenseShouldBeOpen()
  {
    let settings = require("../../api/settings.js").GetSettings();
    return !settings.acceptedagreement;
  }

  returnIfExperimentalShouldBeOpen()
  {
    
    if (this.returnIfLicenseShouldBeOpen())
    {
      return false;
    }
    let settings = require("../../api/settings.js").GetSettings();
    if (this.props.experimentalOpen == true )
    {
      if (settings.experimentalWarning == null)
      {
        return true;
      }

      if (settings.experimentalWarning == false)
      {
        return false;
      }
      else
      {
        return true;
      }
    }else
    {
      return false;
    }
  }

  render() {
    const agreementOpen = this.returnIfLicenseShouldBeOpen();
    const experimentalOpenbool = this.returnIfExperimentalShouldBeOpen();
    return (
      <div id="overviewPage">
        <Modal key="agreement-modal" open={agreementOpen} onClose={ () => {return true} } center showCloseIcon={false} classNames={{ modal: 'modal' }}>
          <h2>License Agreement</h2>
          {this.returnLicenseModalInternal()}
        </Modal>
        <Modal key="experiment-modal" open={experimentalOpenbool} onClose={this.closeExperimentalModal} center classNames={{ modal: 'modal' }}>
    
          {this.returnExperimentalModalInternal()}
        </Modal>
        <div className="left-stats">
          <div id="nxs-balance-info">
            <div className="h2">Balance (NXS)</div>
            <img src={nxsStake} />
            <div className="overviewValue">{this.props.balance}</div>
          </div>

          <div id="nxs-currency-value-info">
            <div className="h2">Currency Value (USD)</div>
            <img src={nxsStake} />
            <div className="overviewValue">{this.calculateUSDvalue()}</div>
          </div>

          <div id="nxs-transactions-info">
            <div className="h2">Transactions</div>
            <img src={nxsStake} />
            <div className="overviewValue">{this.props.txtotal}</div>
          </div>

          <div id="nxs-market-price-info">
            <div className="h2">Market Price (BTC)</div>
            <img src={nxsStake} />
            <div className="overviewValue">{this.props.BTC.toFixed(8)}</div>
          </div>

          <div id="nxs-market-price-info">
            <div className="h2">Market Price</div>
            <img src={nxsStake} />
            <div className="overviewValue">0</div>
          </div>

          <div id="nxs-market-price-info">
            <div className="h2">Market Price</div>
            <img src={nxsStake} />
            <div className="overviewValue">0</div>
          </div>
        </div>
        <NetworkGlobe />
        <div className="right-stats">
          <div id="nxs-connections-info">
            <div className="h2">Connections</div>
            <img
              id="nxs-getinfo-connections-image"
              src={this.connectionsImage()}
            />
            <div className="overviewValue">{this.props.connections}</div>
          </div>
          <div id="nxs-blockweight-info">
            <div className="h2">Block Weight</div>
            <img
              src={this.blockWeightImage()}
              id="nxs-getinfo-blockweight-image"
            />
            <div className="overviewValue">{this.props.blockweight}</div>
          </div>
          <div id="nxs-blocks-info">
            <div className="h2">Block Count</div>
            <img src={nxsblocks} />
            <div className="overviewValue">{this.props.blocks}</div>
          </div>
          <div id="nxs-trustweight-info">
            <div className="h2">Trust Weight</div>
            <img id="nxs-getinfo-trustweight-image" src={this.trustImg()} />
            <div className="overviewValue">{this.props.trustweight}</div>
          </div>
          <div id="nxs-interestweight-info">
            <div className="h2">Interest Rate</div>
            <img src={interestRate} />
            <div className="overviewValue">
              {this.props.interestweight + "%"}
            </div>
          </div>
          <div id="nxs-stakeweight-info">
            <div className="h2">Stake Weight</div>
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
