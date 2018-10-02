import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import { Route, Redirect } from "react-router";
import { connect } from "react-redux";

import styles from "./style.css";
import SettingsApp from "./SettingsApp";
import SettingsCore from "./SettingsCore";
import SettingsMarket from "./SettingsMarket";
import SettingsStyle from "./SettingsStyle";
import Security from "../Security/Security";
import Login from "../Security/Login";
import Unencrypted from "../Security/Unencrypted";
import * as RPC from "../../script/rpc";

import ContextMenuBuilder from "../../contextmenu";
import { remote } from "electron";

// import images here
import settingsimg from "../../images/settings.svg";
import coreImg from "../../images/core.svg";
import logoImg from "../../images/logo.svg";
import lockImg from "../../images/lock-minting.svg";
import marketImg from "../../images/marketstats.svg";
import styleImg from "../../images/developer.svg";

const mapStateToProps = state => {
  return {
    ...state.common
  };
};

const mapDispatchToProps = dispatch => ({});

class Settings extends Component {
  componentDidMount() {
    this.props.googleanalytics.SendScreen("Settings");
    window.addEventListener("contextmenu", this.setupcontextmenu, false);
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

  render() {
    // Redirect to application settings if the pathname matches the url (eg: /Settings = /Settings)
    if (this.props.location.pathname === this.props.match.url) {
      console.log("Redirecting to Application Settings");

      return <Redirect to={`${this.props.match.url}/App`} />;
    }

    return (
      <div id="settings" className="animated fadeIn">
        <div id="settings-container">
          <h2>
            <img src={settingsimg} className="hdr-img" />
            Settings
          </h2>

          <div className="panel">
            <ul className="tabs">
              <li>
                <NavLink to={`${this.props.match.url}/App`}>
                  <img src={logoImg} alt="Application" />
                  Application
                </NavLink>
              </li>
              <li>
                <NavLink to={`${this.props.match.url}/Core`}>
                  <img src={coreImg} alt="Core" />
                  Core
                </NavLink>
              </li>
              <li>
                {this.props.encrypted !== true ? (
                  <NavLink to={`${this.props.match.url}/Unencrypted`}>
                    <img src={lockImg} alt="Security" />
                    Security
                  </NavLink>
                ) : (
                  <NavLink to={`${this.props.match.url}/Security`}>
                    <img src={lockImg} alt="Security" />
                    Security
                  </NavLink>
                )}
              </li>
              {/* <li>
                <NavLink to={`${this.props.match.url}/Market`}>
                  <img src={marketImg} alt="Market" />
                  Market
                </NavLink>
              </li> */}
              <li>
                <NavLink to={`${this.props.match.url}/Style`}>
                  <img src={styleImg} alt="Style" />
                  Style
                </NavLink>
              </li>
            </ul>

            <div className="grid-container">
              <Route
                exact
                path={`${this.props.match.path}/`}
                render={props => <SettingsApp {...this.props} />}
              />
              <Route
                path={`${this.props.match.path}/App`}
                render={props => <SettingsApp {...this.props} />}
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
                path={`${this.props.match.path}/Style`}
                component={SettingsStyle}
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
                path={`${this.props.match.path}/Unencrypted`}
                component={Unencrypted}
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
