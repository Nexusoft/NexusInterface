import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import { Route, Redirect } from "react-router";
import { connect } from "react-redux";

import styles from "./style.css";
import SettingsApp from "./SettingsApp";
import SettingsCore from "./SettingsCore";
import Security from "../Security/Security";
import Login from "../Security/Login";
import * as RPC from "../../script/rpc";

const mapStateToProps = state => {
  return {
    ...state.common
  };
};

const mapDispatchToProps = dispatch => ({});
class Settings extends Component {
  render() {
    // Redirect to application settings if the pathname matches the url (eg: /Settings = /Settings)
    if (this.props.location.pathname === this.props.match.url) {
      console.log("Redirecting to Application Settings");

      return <Redirect to={`${this.props.match.url}/App`} />;
    }

    return (
      <div id="settings">
        <div id="settings-container">
          <h2>Settings</h2>
          <button onClick={() => RPC.PROMISE("walletlock", [])}>Lock</button>

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
              <li>
                <NavLink to={`${this.props.match.url}/Security`}>
                  <img
                    src="images/icon-security.png"
                    alt="Security"
                    onClick={() => console.log("click")}
                  />Security
                </NavLink>
              </li>
            </ul>

            <div className="grid-container">
              <Route
                exact
                path={`${this.props.match.path}/`}
                component={SettingsApp}
              />
              <Route
                path={`${this.props.match.path}/App`}
                component={SettingsApp}
              />
              <Route
                path={`${this.props.match.path}/Core`}
                component={SettingsCore}
              />

              <Route
                path={`${this.props.match.path}/Security`}
                render={props =>
                  this.props.loggedIn === true ? (
                    <Security {...props} />
                  ) : (
                    <Redirect to={`${this.props.match.path}/Login`} />
                  )
                }
              />

              <Route
                path={`${this.props.match.path}/Login`}
                component={Login}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Settings);
