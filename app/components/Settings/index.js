import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import { Route } from "react-router";
import styles from "./style.css";

import SettingsApp from "./SettingsApp";
import SettingsCore from "./SettingsCore";
import SettingsDev from "./SettingsDev";

export default class Settings extends Component {
  render() {
    return (

      <div id="settings">

        <div id="settings-container">

	        <h2>Settings</h2>

	        <div className="panel">

            <ul className="tabs">

              <li>
                <NavLink to={`${this.props.match.url}/app`}>
                  <img src="images/icon-home.png" alt="Application" />Application
                </NavLink>
              </li>
              <li>
                <NavLink to={`${this.props.match.url}/core`}>
                  <img src="images/icon-explorer.png" alt="Core" />Core
                </NavLink>
              </li>
              <li>
                <NavLink to={`${this.props.match.url}/development`}>
                  <img src="images/icon-developer.png" alt="Development" />Development
                </NavLink>
              </li>

            </ul>

            <div className="grid-container">

              <Route path={`${this.props.match.path}/app`} component={SettingsApp}/>
              <Route path={`${this.props.match.path}/core`} component={SettingsCore}/>
              <Route path={`${this.props.match.path}/development`} component={SettingsDev}/>

            </div>

          </div>

        </div>

      </div>
    );
  }
}
