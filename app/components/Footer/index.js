import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import styles from "./style.css";

export default class Footer extends Component {
  render() {
    return (
      <div id="Footer">
        <div id="ftr-line" />
        <div id="navigation">
          <NavLink exact to="/">
            <img src="images/icon-home.png" alt="Overview" />
          </NavLink>
          <NavLink to="/SendRecieve">
            <img src="images/icon-send.png" alt="SendRecieve" />
          </NavLink>
          <NavLink to="/Transactions">
            <img src="images/icon-transactions.png" alt="Transactions" />
          </NavLink>
          <NavLink to="/Market">
            <img src="images/icon-market.png" alt="Market Data" />
          </NavLink>
          <NavLink to="/Addressbook">
            <img src="images/icon-contacts.png" alt="Addressbook" />
          </NavLink>
          <NavLink to="/BlockExplorer">
            <img src="images/icon-explorer.png" alt="Block Explorer" />
          </NavLink>
          <NavLink to="/Settings">
            <img src="images/icon-settings.png" alt="Settings" />
          </NavLink>
          <NavLink to="/Terminal">
            <img src="images/icon-console.png" alt="Command Line Interface" />
          </NavLink>
          <NavLink to="/SecurityLogin">
            <img src="images/icon-security.png" alt="Security" />
          </NavLink>
          <NavLink to="/StyleGuide">
            <img src="images/icon-developer.png" alt="Style Guide" />
          </NavLink>
          <NavLink to="/List">
            <img src="images/icon-trustlist.png" alt="List" />
          </NavLink>
        </div>
      </div>
    );
  }
}
