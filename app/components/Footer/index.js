import React, { Component } from "react";
import { Link } from "react-router-dom";
import styles from "./style.css";

export default class Footer extends Component {
  render() {
    return (
      <div id="Footer">
        <div id="ftr-line" />
        <div id="navigation">
          <Link to="/">
            <img src="images/icon-home.png" alt="Overview" />
          </Link>
          <Link to="/SendRecieve">
            <img src="images/icon-send.png" alt="SendRecieve" />
          </Link>
          <Link to="/Market">
            <img src="images/icon-market.png" alt="Market Data" />
          </Link>
          <Link to="/Addressbook">
            <img src="images/icon-contacts.png" alt="Addressbook" />
          </Link>
          <Link to="/BlockExplorer">
            <img src="images/icon-explorer.png" alt="Block Explorer" />
          </Link>
          <Link to="/Settings">
            <img src="images/icon-settings.png" alt="Settings" />
          </Link>
          <Link to="/Terminal">
            <img src="images/icon-console.png" alt="Command Line Interface" />
          </Link>
          <Link to="/SecurityLogin">
            <img src="images/icon-security.png" alt="Security" />
          </Link>
          <Link to="/List">
            <img src="images/icon-trustlist.png" alt="List" />
          </Link>
        </div>
      </div>
    );
  }
}
