import React, { Component } from "react";
import { connect } from "react-redux";
import { remote } from "electron";
import Request from "request";
import { bindActionCreators } from "redux";
import { Squares } from "react-activity";
// import "react-activity/lib/Dots/Dots.css";
import * as TYPE from "../../actions/actiontypes";
import ContextMenuBuilder from "../../contextmenu";
import styles from "./style.css";

import arrow from "../../images/arrow.svg";
import * as actionsCreators from "../../actions/exchangeActionCreators";
import { FormattedMessage } from "react-intl";

const mapStateToProps = state => {
  return { ...state.common, ...state.exchange };
};

const mapDispatchToProps = dispatch =>
  bindActionCreators(actionsCreators, dispatch);

class Precise extends Component {
  componentDidMount() {
    this.props.GetAvailaleCoins();
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
      if (this.props.greenLight) {
        this.props.clearQuote();
      }
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
      this.props.ToggleAcyncButtons();
      let pair = this.props.from + "_" + this.props.to;
      this.props.GetQuote(pair, this.props.ammount);
    } else alert("Outside trade-able ammounts");
  }

  executeTransaction() {
    let pair = this.props.from + "_" + this.props.to;
    if (this.props.toAddress !== "") {
      if (this.props.refundAddress !== "") {
        this.props.ToggleAcyncButtons();
        Request(
          {
            method: "GET",
            url: `https://shapeshift.io/validateAddress/${
              this.props.toAddress
            }/${this.props.to}`
          },
          (error, response, body) => {
            if (response.statusCode === 200) {
              let res = JSON.parse(response.body);
              if (!res.isvalid) {
                alert(`${res.error}\n ${this.props.to} Address.`);
              } else {
                Request(
                  {
                    method: "GET",
                    url: `https://shapeshift.io/validateAddress/${
                      this.props.refundAddress
                    }/${this.props.from}`
                  },
                  (error, response, body) => {
                    if (response.statusCode === 200) {
                      let res = JSON.parse(response.body);
                      if (!res.isvalid) {
                        alert(`${res.error}\n ${this.props.from} Address.`);
                      } else {
                        this.props.InitiateQuotedTransaction(
                          pair,
                          this.props.ammount,
                          this.props.toAddress,
                          this.props.refundAddress
                        );
                      }
                    }
                  }
                );
              }
            }
          }
        );
      } else alert("Refund Address is required");
    } else alert(`${this.currencylabel()} Address is required`);
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
            disabled={this.props.acyncButtonFlag}
          >
            {this.props.acyncButtonFlag === false ? (
              <FormattedMessage
                id="Exchange.ExecuteTrade"
                defaultMessage="EXECUTE TRADE"
              />
            ) : (
              <Squares color="white" />
            )}
          </button>
        );
      } else {
        return (
          <button
            className="button primary hero"
            onClick={() => {
              this.getQuote();
            }}
            disabled={this.props.acyncButtonFlag}
          >
            {this.props.acyncButtonFlag === false ? (
              <FormattedMessage
                id="Exchange.QUOTE"
                defaultMessage="GET QUOTE"
              />
            ) : (
              <Squares color="white" />
            )}
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
                  <h3>
                    <FormattedMessage
                      id="Exchange.YouAreSending"
                      defaultMessage="YOU ARE SENDING"
                    />
                  </h3>
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
                  <h3>
                    <FormattedMessage
                      id="Exchange.YouWillReceive"
                      defaultMessage="YOU WILL RECEIVE"
                    />
                  </h3>

                  {this.transferCalculator()}
                </div>
              </div>
            </div>
            {this.buttonSwitcher()}
          </div>
        );
      } else {
        return (
          <h1>
            <FormattedMessage
              id="Exchange.NotAvailible"
              defaultMessage="That pair is temporarily unavailable for trades"
            />
          </h1>
        );
      }
    } else return null;
  }

  render() {
    return (
      <div id="ExchngeContainer">
        <div id="shifty-pannel">
          <div>
            <form>
              <fieldset>
                <legend>
                  <FormattedMessage id="Exchange.Send" defaultMessage="Send" />
                </legend>

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
                  <label>
                    {" "}
                    <FormattedMessage
                      id="Exchange.TradeAmount"
                      defaultMessage="Trade Amount"
                    />
                    :
                  </label>
                  <FormattedMessage
                    id="Exchange.MinTrade"
                    defaultMessage="Minimum Trade"
                  >
                    {MT => (
                      <input
                        type="text"
                        placeholder={
                          this.minAmmount() + " " + this.props.from + MT
                        }
                        value={this.props.ammount}
                        onChange={e => this.ammountHandler(e.target.value)}
                        required
                      />
                    )}
                  </FormattedMessage>
                </div>
                {this.props.from !== "NXS" ? (
                  <div className="field">
                    <label>
                      <FormattedMessage
                        id="Exchange.RefundAddress"
                        defaultMessage="Refund Address"
                      />
                      :
                    </label>
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
                <legend>
                  <FormattedMessage
                    id="Exchange.Receive"
                    defaultMessage="Receive"
                  />
                </legend>
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
                  <label>
                    {this.currencylabel()}{" "}
                    <FormattedMessage
                      id="Exchange.BCAddress"
                      defaultMessage="Address"
                    />
                    :
                  </label>
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
