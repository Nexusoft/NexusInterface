import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import styles from "./style.css";

import mainlogo from "images/logo.svg";
import sendImg from "images/send.svg";
import marketImg from "images/market.svg";
import transactionsImg from "images/transactions.svg";
import addressImg from "images/addressbook.svg";
import settingsImg from "images/settings.svg";
import consoleImg from "images/console.svg";
import styleImg from "images/developer.svg";
import listImg from "images/trust-list.svg";

export default class Footer extends Component {
  render() {
    return (
      <div id="Footer">
        <div id="ftr-line" className="animated fadeIn " />
        <div id="navigation" className="animated bounceInUp ">
          <NavLink exact to="/">
            <img src={mainlogo} alt="Overview" />
            <div className="tooltip top">Overview</div>
          </NavLink>
          <NavLink to="/SendRecieve">
            <img src={sendImg} alt="SendRecieve" />
            <div className="tooltip top">Send&nbsp;NXS</div>
          </NavLink>
          <NavLink to="/Transactions">
            <img src={transactionsImg} alt="Transactions" />
            <div className="tooltip top">Transactions</div>
          </NavLink>
          <NavLink to="/Market">
            <img src={marketImg} alt="Market Data" />
            <div className="tooltip top">Market&nbsp;Data</div>
          </NavLink>
          <NavLink to="/Addressbook">
            <img src={addressImg} alt="Address Book" />
            <div className="tooltip top">Address&nbsp;Book</div>
          </NavLink>
          {/*
          <NavLink to="/BlockExplorer">
            <img src="images/blockexplorer.svg" alt="Block Explorer" />
            <div className="tooltip top">Block&nbsp;Explorer</div>
          </NavLink> */}
          <NavLink to="/Settings">
            <img src={settingsImg} alt="Settings" />
            <div className="tooltip top">Settings</div>
          </NavLink>
          <NavLink to="/Terminal">
            <img src={consoleImg} alt="Console" />
            <div className="tooltip top">Console</div>
          </NavLink>
          <NavLink to="/StyleGuide">
            <img src={styleImg} alt="Style Guide" />
            <div className="tooltip top">Style&nbsp;Guide</div>
          <NavLink to="/Exchange">
            <img src="images/shapeshiftlogo.png" alt="Exchange" />
            <div className="tooltip top">Exchange</div>
          </NavLink>
          <NavLink to="/List">
            <img src={listImg} alt="Trust List" />
            <div className="tooltip top">Trust&nbsp;List</div>
          </NavLink>
        </div>
      </div>
    );
  }
}
