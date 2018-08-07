import React, { Component } from "react";
import { connect } from "react-redux";
import { remote } from "electron";
import Request from "request";
import { bindActionCreators } from "redux";

import * as TYPE from "../../actions/actiontypes";
import ContextMenuBuilder from "../../contextmenu";
import styles from "./style.css";

import arrowimg from "../../images/TEMPORARYARROW.png";
import * as actionsCreators from "../../actions/shapeshiftActionCreators";

const mapStateToProps = state => {
  return { ...state.common, ...state.exchange };
};

const mapDispatchToProps = dispatch =>
  bindActionCreators(actionsCreators, dispatch);

class Shapeshift extends Component {
  componentDidMount() {
    window.addEventListener("contextmenu", this.setupcontextmenu, false);
    this.props.GetAvailaleCoins();
    Request(
      {
        url: "https://shapeshift.io/marketinfo/nxs_btc",
        json: true
      },
      (error, response, body) => {
        if (response.statusCode === 200) {
          console.log(response);
        }
      }
    );
  }
  testapi() {
    console.log("test");
    // Request(
    //   {
    //     url: "https://shapeshift.io/marketinfo/nxs_btc",
    //     json: true
    //   },
    //   (error, response, body) => {
    //     console.log(response);
    //     if (response.statusCode === 200) {
    //       console.log(response);
    //     }
    //   }
    // );
    // Request(
    //   {
    //     url: "https://shapeshift.io/limit/nxs_btc",
    //     json: true
    //   },
    //   (error, response, body) => {
    //     console.log(response);
    //     if (response.statusCode === 200) {
    //       console.log(response);
    //     }
    //   }
    // );
    // Request(
    //   {
    //     url: "https://shapeshift.io/getcoins",
    //     json: true
    //   },
    //   (error, response, body) => {
    //     if (response.statusCode === 200) {
    //       console.log(response.body);
    //     }
    //   }
    // );
    this.props.GetAvailaleCoins();
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

  buildConfermation() {
    console.log(this.props);
    return (
      <div id="confirmation">
        <h1>confirmation</h1>
        <img src={arrowimg} style={{ height: "100px" }} /> <h1>goes here</h1>
      </div>
    );
  }

  optionbuilder() {
    return Object.values(this.props.availableCoins).map(e => {
      return (
        <option key={e.symbol} value={e.symbol}>
          {e.name}
        </option>
      );
    });
  }

  render() {
    return (
      <div id="Shapeshift">
        <h2>Exchange Powered By Shapeshift</h2>

        <div className="panel">
          <button onClick={() => this.testapi()}>test</button>
          <div id="shifty-pannel">
            <div>
              <form>
                <fieldset>
                  <legend>Send</legend>

                  <div className="field">
                    <label>
                      <select
                        className="form-control"
                        onChange={e => this.props.FromSetter(e.target.value)}
                      >
                        {this.optionbuilder()}
                      </select>
                    </label>
                  </div>

                  <div className="field">
                    <label>Password:</label>
                    <input type="password" placeholder="Password" required />
                    <span className="hint">Password is required</span>
                  </div>
                </fieldset>
              </form>
            </div>
            <div>
              <div id="line" />
            </div>
            <div>
              <form>
                <fieldset>
                  <legend>Recieve</legend>
                  <div className="field">
                    <select onChange={e => this.props.ToSetter(e.target.value)}>
                      {this.optionbuilder()}
                    </select>
                  </div>

                  <div className="field">
                    <label>Password:</label>
                    <input type="text" placeholder="Password" required />
                  </div>
                </fieldset>
              </form>
            </div>
          </div>
          <div>{this.buildConfermation()}</div>
        </div>
      </div>
    );
  }
}
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Shapeshift);
