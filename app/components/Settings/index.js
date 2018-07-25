import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import { Route, Redirect } from "react-router";
import { connect } from "react-redux";

import styles from "./style.css";
import SettingsApp from "./SettingsApp";
import SettingsCore from "./SettingsCore";
import SettingsMarket from "./SettingsMarket";
import Security from "../Security/Security";
import Login from "../Security/Login";
import * as RPC from "../../script/rpc";


import ContextMenuBuilder from "../../contextmenu";
import {remote} from "electron";


const mapStateToProps = state => {
  return {
    ...state.common
  };
};

const mapDispatchToProps = dispatch => ({});

class Settings extends Component {

  
    componentDidMount()
    {
      window.addEventListener("contextmenu", this.setupcontextmenu, false);
    }
  
    componentWillUnmount()
    {
      window.removeEventListener("contextmenu",this.setupcontextmenu);
    }
  
    setupcontextmenu(e) {
      e.preventDefault();
      const contextmenu = new ContextMenuBuilder().defaultContext;
      //build default
      let defaultcontextmenu = remote.Menu.buildFromTemplate(contextmenu);
      defaultcontextmenu.popup(remote.getCurrentWindow());
    }
    

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
                  <img src="images/icon-security.png" alt="Security" />Security
                </NavLink>
              </li>
              <li>
                <NavLink to={`${this.props.match.url}/Market`}>
                  <img src="images/icon-market.png" alt="Martket" />Martket
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
                path={`${this.props.match.path}/Market`}
                component={SettingsMarket}
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
