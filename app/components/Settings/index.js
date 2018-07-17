import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import { Route, Redirect } from "react-router";
import styles from "./style.css";

import SettingsApp from "./SettingsApp";
import SettingsCore from "./SettingsCore";

export default class Settings extends Component {
  render() {

    // Redirect to application settings if the pathname matches the url (eg: /Settings = /Settings)
    if (this.props.location.pathname === this.props.match.url) {

      console.log("Redirecting to Application Settings");
      
      return (
        <Redirect to={`${this.props.match.url}/App`} />
      )

    }

    return (

      <div id="settings">

        <div id="settings-container">

	        <h2>Settings</h2>

	        <div className="panel">

            <ul className="tabs">

              <li>
                <NavLink to={`${this.props.match.url}/App`}>
                  <img src="images/icon-home.png" alt="Application" />Application
                </NavLink>
              </li>
              <li>
                <NavLink to={`${this.props.match.url}/Core`}>
                  <img src="images/icon-explorer.png" alt="Core" />Core
                </NavLink>
              </li>

            </ul>

            <div className="grid-container">

              <Route exact path={`${this.props.match.path}/`} component={SettingsApp}/>
              <Route path={`${this.props.match.path}/App`} component={SettingsApp}/>
              <Route path={`${this.props.match.path}/Core`} component={SettingsCore}/>

            </div>

          </div>

        </div>

      </div>
    );
  }
}
