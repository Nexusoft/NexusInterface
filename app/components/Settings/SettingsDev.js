import React, { Component } from "react";
import { Link } from "react-router-dom";
import styles from "./style.css";

export default class SettingsDev extends Component {
  render() {
    return (
      <section id="development">

        <form className="aligned">

          <div className="field">
            <label htmlFor="devmode">Developer Mode</label>
            <input id="devmode" type="checkbox" className="switch" onChange="updateDeveloperMode(this)" data-tooltip="Development mode enables advanced features to aid in development. After enabling the wallet must be closed and reopened to enable those features"/>
          </div>

          <div className="clear-both"></div>

        </form>

      </section>
    );
  }
}
