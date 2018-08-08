import React, { Component } from "react";
import { connect } from "react-redux";
import { remote } from "electron";
import Request from "request";
import { bindActionCreators } from "redux";

import * as TYPE from "../../actions/actiontypes";
import ContextMenuBuilder from "../../contextmenu";
import styles from "./style.css";

import arrow from "../../images/arrow.png";
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

  componentDidUpdate(prevProps) {
    if (
      (this.props.to !== prevProps.to || this.props.from !== prevProps.from) &&
      this.props.from !== this.props.to
    ) {
      let pair = this.props.from + "_" + this.props.to;
      this.props.GetPairMarketInfo(pair);
    }
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

    if (this.props.to && this.props.from && this.props.from !== this.props.to) {
      return (
        <div id="confirmation">
          <div id="sendSideConfirm">
            <h3>YOU ARE SENDING</h3>
            <img
              style={{ height: "100px" }}
              src={this.props.availableCoins[this.props.from].image}
            />
          </div>
          <img src={arrow} style={{ height: "100px" }} />
          <div id="recieveSideConfirm">
            <h3>YOU WILL RECIEVE</h3>
            <img
              style={{ height: "100px" }}
              src={this.props.availableCoins[this.props.to].image}
            />
          </div>
        </div>
      );
    } else return null;
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

  minAmmount() {
    if (this.props.marketPairData.minimum) {
      return this.props.marketPairData.minimum;
    } else return 0;
  }

  maxAmmount() {
    if (this.props.marketPairData.maxLimit) {
      return this.props.marketPairData.maxLimit;
    } else return 1;
  }

  currencylabel() {
    if (this.props.to) {
      return this.props.availableCoins[this.props.to].name;
    } else return null;
  }
  ammountHandler(value) {
    if (value === Number) {
      consolelog(typeof parseFloat(value));
    }
  }

  render() {
    return (
      <div id="Shapeshift">
        <h2>Exchange Powered By Shapeshift</h2>

        <div className="panel">
          {/* <button onClick={() => this.testapi()}>test</button> */}
          <div id="shifty-pannel">
            <div>
              <form>
                <fieldset>
                  <legend>Send</legend>

                  <div className="field">
                    <select
                      className="soflow-color"
                      value={this.props.from}
                      onChange={e => this.props.FromSetter(e.target.value)}
                    >
                      {this.optionbuilder()}
                    </select>
                  </div>
                  <div className="field">
                    <input
                      type="text"
                      placeholder={this.minAmmount()}
                      // value={this.props.ammount}
                      // onChange={e => this.ammountHandler(e.target.value)}
                      pattern={"^[0-9.-/]+$"}
                      required
                    />
                  </div>
                  {this.props.from !== "nxs" ? (
                    <div className="field">
                      <label>Refund Address:</label>
                      <input type="text" required />
                    </div>
                  ) : null}
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
                    <select
                      className="soflow-color"
                      onChange={e => this.props.ToSetter(e.target.value)}
                      value={this.props.to}
                    >
                      {this.optionbuilder()}
                    </select>
                  </div>

                  <div className="field">
                    <label>{this.currencylabel()} Address:</label>
                    <input type="text" required />
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
