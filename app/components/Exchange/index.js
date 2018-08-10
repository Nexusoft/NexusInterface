import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import { Route, Redirect } from "react-router";
import { connect } from "react-redux";

import styles from "./style.css";
import Fast from "./Fast";
import Precise from "./Precise";
import * as RPC from "../../script/rpc";

import ContextMenuBuilder from "../../contextmenu";
import { remote } from "electron";

const mapStateToProps = state => {
  return {
    ...state.common
  };
};

const mapDispatchToProps = dispatch => ({});

class Exchange extends Component {
  // componentDidMount() {
  //   this.props.googleanalytics.SendScreen("Exchange");
  //   window.addEventListener("contextmenu", this.setupcontextmenu, false);
  // }

  // componentWillUnmount() {
  //   window.removeEventListener("contextmenu", this.setupcontextmenu);
  // }

  // setupcontextmenu(e) {
  //   e.preventDefault();
  //   const contextmenu = new ContextMenuBuilder().defaultContext;
  //   //build default
  //   let defaultcontextmenu = remote.Menu.buildFromTemplate(contextmenu);
  //   defaultcontextmenu.popup(remote.getCurrentWindow());
  // }

  render() {
    // Redirect to application settings if the pathname matches the url (eg: /Settings = /Settings)
    // if (this.props.location.pathname === this.props.match.url) {
    //   console.log("Redirecting to Precice trading");

    //   return <Redirect to={`${this.props.match.url}/Precice`} />;
    // }
    console.log("index", this.props);
    return (
      <div id="Exchange">
        <div id="Exchange-container">
          <h2>Exchange</h2>

          <div className="panel">
            <ul className="tabs">
              <li>
                <NavLink to={`${this.props.match.url}/Precise`}>
                  <img src="images/icon-home.png" alt="Precise" />
                  Precise
                </NavLink>
              </li>
              <li>
                <NavLink to={`${this.props.match.url}/Fast`}>
                  <img src="images/icon-explorer.png" alt="Fast" />
                  Fast
                </NavLink>
              </li>
            </ul>

            <div className="grid-container">
              <Route
                exact
                path={`${this.props.match.path}/`}
                render={() => <Precise />}
              />
              <Route
                path={`${this.props.match.path}/Precise`}
                render={props => <Precise />}
              />
              <Route
                path={`${this.props.match.path}/Fast`}
                render={() => <Fast />}
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
)(Exchange);
