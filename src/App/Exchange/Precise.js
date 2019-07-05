/*
Title: Precise Exhange page
Description: Handle Precise exchanges through shapeshift api.
Last Modified by: Brian Smith
*/

// External Dependencies
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Request from 'request';
import { bindActionCreators } from 'redux';
import { Squares } from 'react-activity';
import googleanalytics from 'scripts/googleanalytics';

// Internal Dependencies
import ExchangeForm from './ExchangeForm';
import UIController from 'components/UIController';
import styles from './style.css';

import arrow from 'images/arrow.svg';
import * as actionsCreators from 'actions/exchangeActionCreators';
import Text from 'components/Text';

// React-Redux mandatory methods
const mapStateToProps = state => {
  return { ...state.common, ...state.exchange };
};
const mapDispatchToProps = dispatch =>
  bindActionCreators(actionsCreators, dispatch);

/**
 * The Internal Page to use the Precise function on Shapeshift
 *
 * @class Precise
 * @extends {Component}
 */
class Precise extends Component {
  // React Method (Life cycle hook)
  componentDidMount() {
    this.props.GetAvailaleCoins();
  }
  // React Method (Life cycle hook)
  componentDidUpdate(prevProps) {
    let pair = this.props.from + '_' + this.props.to;
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

  // Class methods
  /**
   * Calculates the gross and final trade amount
   *
   * @returns
   * @memberof Precise
   */
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
    } else return null;
  }

  /**
   * Generates the available coins to transfer
   *
   * @returns
   * @memberof Precise
   */
  optionbuilder() {
    return Object.values(this.props.availableCoins).map(e => {
      if (e.status === 'available') {
        return (
          <option key={e.symbol} value={e.symbol}>
            {e.name}
          </option>
        );
      } else return null;
    });
  }

  /**
   * Returns the min amount a User must send
   *
   * @returns
   * @memberof Precise
   */
  minAmmount() {
    if (this.props.marketPairData.minimum) {
      return this.props.marketPairData.minimum;
    } else return 0;
  }

  /**
   * Return the max amount a User can send
   *
   * @returns
   * @memberof Precise
   */
  maxAmmount() {
    if (this.props.marketPairData.maxLimit) {
      return this.props.marketPairData.maxLimit;
    } else return 1;
  }

  /**
   * Returns the currency lable
   *
   * @returns
   * @memberof Precise
   */
  currencylabel() {
    if (this.props.to) {
      return this.props.availableCoins[this.props.to].name;
    } else return null;
  }

  /**
   * Handles the amount field
   *
   * @param {*} value
   * @returns
   * @memberof Precise
   */
  ammountHandler(value) {
    if (/^[0-9.]+$/.test(value) | (value === '')) {
      this.props.ammountUpdater(value);
      if (this.props.greenLight) {
        this.props.clearQuote();
      }
    } else {
      return null;
    }
  }

  /**
   * Handles the to and from switcher
   *
   * @param {*} e
   * @param {*} switcher
   * @memberof Precise
   */
  toFromHandler(e, switcher) {
    if (switcher === 'to') {
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

  /**
   * Handles the get Quote button
   *
   * @memberof Precise
   */
  getQuote() {
    this.props.ToggleAcyncButtons();
    if (this.props.withinBounds) {
      this.props.ToggleAcyncButtons();
      let pair = this.props.from + '_' + this.props.to;
      this.props.GetQuote(pair, this.props.ammount);
    } else {
      UIController.showNotification('Outside trade-able ammounts', 'error');
    }
    this.props.ToggleAcyncButtons();
  }

  /**
   * Handles the execution of the trade
   *
   * @memberof Precise
   */
  executeTransaction() {
    this.props.ToggleAcyncButtons();
    googleanalytics.SendEvent('Shapeshift', 'Precise', 'Sent', 1);
    let pair = this.props.from + '_' + this.props.to;
    if (this.props.toAddress !== '') {
      if (this.props.refundAddress !== '') {
        Request(
          {
            method: 'GET',
            url: `https://shapeshift.io/validateAddress/${
              this.props.toAddress
            }/${this.props.to}`,
          },
          (error, response, body) => {
            if (response.statusCode === 200) {
              let res = JSON.parse(response.body);
              if (!res.isvalid) {
                UIController.showNotification(
                  `${res.error}\n ${this.props.to} Address.`,
                  'error'
                );
              } else {
                Request(
                  {
                    method: 'GET',
                    url: `https://shapeshift.io/validateAddress/${
                      this.props.refundAddress
                    }/${this.props.from}`,
                  },
                  (error, response, body) => {
                    if (response.statusCode === 200) {
                      let res = JSON.parse(response.body);
                      if (!res.isvalid) {
                        UIController.showNotification(
                          `${res.error}\n ${this.props.from} Address.`,
                          'error'
                        );
                      } else {
                        this.props.InitiateQuotedTransaction(
                          pair,
                          this.props.ammount,
                          this.props.toAddress,
                          this.props.refundAddress
                        );
                      }
                    }
                    if (error) {
                      console.log(error);
                    }
                  }
                );
              }
            }
          }
        );
      } else
        UIController.showNotification('Refund Address is required', 'error');
    } else
      UIController.showNotification(
        `${this.currencylabel()} Address is required`,
        'error'
      );
    this.props.ToggleAcyncButtons();
  }

  /**
   * Handles switching the button to enable the user to execute the trade
   *
   * @returns
   * @memberof Precise
   */
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
              <Text id="Exchange.ExecuteTrade" />
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
              <Text id="Exchange.QUOTE" />
            ) : (
              <Squares color="white" />
            )}
          </button>
        );
      }
    }
  }

  /**
   * Build the confirmation modal
   *
   * @returns
   * @memberof Precise
   */
  buildConfermation() {
    if (
      this.props.to &&
      this.props.from &&
      this.props.from !== this.props.to
      // &&
      // !this.props.busyFlag
    ) {
      if (this.props.availablePair) {
        return (
          <div id="confirmationContainer">
            <div id="confirmation">
              <div id="sendSideConfirm">
                <div className="confirmationWords">
                  <h3>
                    <Text id="Exchange.YouAreSending" />
                  </h3>
                  <div>
                    {this.props.ammount} {this.props.from}
                  </div>
                </div>
                <img
                  style={{ height: '100px', margin: '10px' }}
                  src={this.props.availableCoins[this.props.from].image}
                />
              </div>
              <img src={arrow} style={{ height: '100px' }} />
              <div id="recieveSideConfirm">
                <img
                  style={{ height: '100px', margin: '10px' }}
                  src={this.props.availableCoins[this.props.to].image}
                />
                <div className="confirmationWords">
                  <h3>
                    <Text id="Exchange.YouWillReceive" />
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
            <Text id="Exchange.NotAvailible" />
          </h1>
        );
      }
    } else return null;
  }

  // Mandatory React method
  render() {
    return (
      <form>
        <ExchangeForm {...this.props} />
        <div>{this.buildConfermation()}</div>
      </form>
    );
  }
}
// Mandatory React-Redux method
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Precise);
