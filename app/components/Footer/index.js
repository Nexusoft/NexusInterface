import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import styles from "./style.css";

export default class Footer extends Component {
  render() {
    return (
      <div id="Footer">
        <div id="ftr-line"></div>
        <div id="navigation">
          <NavLink exact to="/">
            <img src="images/logo.svg" alt="Overview" />
            <div className="tooltip top">Overview</div>
          </NavLink>
          <NavLink to="/SendRecieve">
            <img src="images/send.svg" alt="SendRecieve" />
            <div className="tooltip top">Send&nbsp;NXS</div>
          </NavLink>
          <NavLink to="/Transactions">
            <img src="images/transactions.svg" alt="Transactions" />
            <div className="tooltip top">Transactions</div>
          </NavLink>
          <NavLink to="/Market">
            <img src="images/market.svg" alt="Market Data" />
            <div className="tooltip top">Market&nbsp;Data</div>
          </NavLink>
          <NavLink to="/Addressbook">
            <img src="images/addressbook.svg" alt="Address Book" />
            <div className="tooltip top">Address&nbsp;Book</div>
          </NavLink>
          <NavLink to="/BlockExplorer">
            <img src="images/blockexplorer.svg" alt="Block Explorer" />
            <div className="tooltip top">Block&nbsp;Explorer</div>
          </NavLink>
          <NavLink to="/Settings">
            <img src="images/settings.svg" alt="Settings" />
            <div className="tooltip top">Settings</div>
          </NavLink>
          <NavLink to="/Terminal">
            <img src="images/console.svg" alt="Console" />
            <div className="tooltip top">Console</div>
          </NavLink>
          <NavLink to="/StyleGuide">
            <img src="images/developer.svg" alt="Style Guide" />
            <div className="tooltip top">Style&nbsp;Guide</div>
          </NavLink>
          <NavLink to="/List">
            <img src="images/trust-list.svg" alt="Trust List" />
            <div className="tooltip top">Trust&nbsp;List</div>
          </NavLink>
        </div>
      </div>
    );
  }
}
