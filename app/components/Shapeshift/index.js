import React, { Component } from "react";
import { connect } from "react-redux";
import { remote } from "electron";
import Request from "request";

import * as TYPE from "../../actions/actiontypes";
import ContextMenuBuilder from "../../contextmenu";
import styles from "./style.css";

const mapStateToProps = state => {
  return { ...state.common };
};

const mapDispatchToProps = dispatch => ({});

class Shapeshift extends Component {
  componentDidMount() {
    window.addEventListener("contextmenu", this.setupcontextmenu, false);
    Request(
      {
        url: "https://shapeshift.io/rate/nxs_btc",
        json: true
      },
      (error, response, body) => {
        if (response.statusCode === 200) {
          console.log(response);
        }
      }
    );
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
    return (
      <div id="Shapeshift">
        <h2>Shapeshift</h2>

        <div className="panel" />
      </div>
    );
  }
}
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Shapeshift);
