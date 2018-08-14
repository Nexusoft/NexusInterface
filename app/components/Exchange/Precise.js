import React, { Component } from "react";
import { connect } from "react-redux";
import { remote } from "electron";
import Request from "request";
import { bindActionCreators } from "redux";

import * as TYPE from "../../actions/actiontypes";
import ContextMenuBuilder from "../../contextmenu";
import styles from "./style.css";

import arrow from "../../images/arrow.png";
import * as actionsCreators from "../../actions/exchangeActionCreators";

const mapStateToProps = state => {
  return { ...state.common, ...state.exchange };
};

const mapDispatchToProps = dispatch =>
  bindActionCreators(actionsCreators, dispatch);

class Precise extends Component {
  componentDidMount() {
    window.addEventListener("contextmenu", this.setupcontextmenu, false);
    this.props.GetAvailaleCoins();
  }

  componentWillUnmount() {
    window.removeEventListener("contextmenu", this.setupcontextmenu);
  }

  componentDidUpdate(prevProps) {
    let pair = this.props.from + "_" + this.props.to;
    if (
      (this.props.to !== prevProps.to || this.props.from !== prevProps.from) &&
      this.props.from !== this.props.to
    ) {
      this.props.GetPairMarketInfo(pair);
    }

    if (this.props.ammount !== prevProps.ammount) {
      let tradeAmmt = parseFloat(this.props.ammount);
      if (tradeAmmt > this.props.marketPairData.minimum) {
        if (tradeAmmt < this.props.marketPairData.maxLimit) {
          if (!this.props.withinBounds) {
            this.props.toggleWithinBounds();
          }
        } else if (this.props.withinBounds) {
          this.props.toggleWithinBounds();
        }
      } else if (this.props.withinBounds) {
        this.props.toggleWithinBounds();
      }
    }
  }

  setupcontextmenu(e) {
    e.preventDefault();
    const contextmenu = new ContextMenuBuilder().defaultContext;
    //build default
    let defaultcontextmenu = remote.Menu.buildFromTemplate(contextmenu);
    defaultcontextmenu.popup(remote.getCurrentWindow());
  }

  transferCalculator() {
    let tradeAmmt = parseFloat(this.props.ammount);
    if (this.props.quote) {
      let grossTrade = tradeAmmt * this.props.quote.quotedRate;
      let finalTrade = grossTrade - this.props.quote.minerFee;

      return (
        <div>
          <div>
            {finalTrade.toFixed(8)} {this.props.to}
          </div>
          <div>
            Deposit: {this.props.quote.depositAmount} {this.props.from}
          </div>
        </div>
      );
      return <div>hello</div>;
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
    if (/^[0-9.]+$/.test(value) | (value === "")) {
      this.props.ammountUpdater(value);
    } else {
      return null;
    }
  }

  toFromHandler(e, switcher) {
    if (switcher === "to") {
      if (e.target.value !== this.props.from) {
        this.props.setBusyFlag();
        this.props.ToSetter(e.target.value);
      } else {
        this.props.ToSetter(e.target.value);
      }
    } else {
      if (e.target.value !== this.props.to) {
        this.props.setBusyFlag();
        this.props.FromSetter(e.target.value);
      } else {
        this.props.FromSetter(e.target.value);
      }
    }
  }

  getQuote() {
    if (this.props.withinBounds) {
      let pair = this.props.from + "_" + this.props.to;
      this.props.GetQuote(pair, this.props.ammount);
    } else alert("Outside trade-able ammounts");
  }

  executeTransaction() {
    console.log("execute");
  }

  buttonSwitcher() {
    if (this.props.withinBounds) {
      if (this.props.greenLight) {
        return (
          <button
            className="button primary hero"
            onClick={() => {
              this.executeTransaction();
            }}
          >
            EXECUTE TRANSACTION
          </button>
        );
      } else {
        return (
          <button
            className="button primary hero"
            onClick={() => {
              this.getQuote();
            }}
          >
            GET QUOTE
          </button>
        );
      }
    }
  }

  buildConfermation() {
    if (
      this.props.to &&
      this.props.from &&
      this.props.from !== this.props.to &&
      !this.props.busyFlag
    ) {
      if (this.props.availablePair) {
        return (
          <div id="confirmationContainer">
            <div id="confirmation">
              <div id="sendSideConfirm">
                <div className="confirmationWords">
                  <h3>YOU ARE SENDING</h3>
                  <div>
                    {this.props.ammount} {this.props.from}
                  </div>
                </div>
                <img
                  style={{ height: "100px", margin: "10px" }}
                  src={this.props.availableCoins[this.props.from].image}
                />
              </div>
              <img src={arrow} style={{ height: "100px" }} />
              <div id="recieveSideConfirm">
                <img
                  style={{ height: "100px", margin: "10px" }}
                  src={this.props.availableCoins[this.props.to].image}
                />
                <div className="confirmationWords">
                  <h3>YOU WILL RECIEVE</h3>

                  {this.transferCalculator()}
                </div>
              </div>
            </div>
            {this.buttonSwitcher()}
          </div>
        );
      } else {
        return <h1>That pair is temporarily unavailable for trades.</h1>;
      }
    } else return null;
  }

  render() {
    console.log(this.props);
    return (
      <div id="ExchngeContainer">
        <div id="shifty-pannel">
          <div>
            <form>
              <fieldset>
                <legend>Send</legend>

                <div className="field">
                  <select
                    className="soflow-color"
                    value={this.props.from}
                    onChange={e => this.toFromHandler(e, "from")}
                  >
                    {this.optionbuilder()}
                  </select>
                </div>
                <div className="field">
                  <label>Trade Ammount:</label>
                  <input
                    type="text"
                    placeholder={
                      this.minAmmount() +
                      " " +
                      this.props.from +
                      " Minimum Tade"
                    }
                    value={this.props.ammount}
                    onChange={e => this.ammountHandler(e.target.value)}
                    required
                  />
                </div>
                {this.props.from !== "NXS" ? (
                  <div className="field">
                    <label>Refund Address:</label>
                    <input
                      type="text"
                      value={this.props.refundAddress}
                      onChange={e =>
                        this.props.refundAddressSetter(e.target.value)
                      }
                      required
                    />
                  </div>
                ) : null}
              </fieldset>
            </form>
          </div>
          <div>
            <div id="line" />
          </div>
          <div>
            <form style={{ display: "flex", height: "100%" }}>
              <fieldset>
                <legend>Recieve</legend>
                <div className="field">
                  <select
                    className="soflow-color"
                    onChange={e => this.toFromHandler(e, "to")}
                    value={this.props.to}
                  >
                    {this.optionbuilder()}
                  </select>
                </div>

                <div className="field">
                  <label>{this.currencylabel()} Address:</label>
                  <input
                    type="text"
                    value={this.props.toAddress}
                    onChange={e => this.props.toAddressSetter(e.target.value)}
                    required
                  />
                </div>
              </fieldset>
            </form>
          </div>
        </div>
        <div>{this.buildConfermation()}</div>
      </div>
    );
  }
}
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Precise);
