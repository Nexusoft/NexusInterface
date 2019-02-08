// External
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Request from 'request';
import { bindActionCreators } from 'redux';
import { Squares } from 'react-activity';
import googleanalytics from 'scripts/googleanalytics';
import Text from 'components/Text';

// Internal
import UIController from 'components/UIController';
import * as actionsCreators from 'actions/exchangeActionCreators';
import ExchangeForm from './ExchangeForm';
import styles from './style.css';

// Images
import arrow from 'images/arrow.svg';

// React-Redux mandatory methods
const mapStateToProps = state => {
  return { ...state.common, ...state.exchange };
};
const mapDispatchToProps = dispatch =>
  bindActionCreators(actionsCreators, dispatch);

/**
 * The internal page to use the Fast method on Shapeshift
 *
 * @class Fast
 * @extends {Component}
 */
class Fast extends Component {
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
   * Calculate the transfer
   *
   * @returns
   * @memberof Fast
   */
  transferCalculator() {
    let tradeAmmt = parseFloat(this.props.ammount);
    if (tradeAmmt > this.props.marketPairData.minimum) {
      if (tradeAmmt < this.props.marketPairData.maxLimit) {
        let grossTrade = tradeAmmt * this.props.marketPairData.rate;
        let finalTrade = grossTrade - this.props.marketPairData.minerFee;
        return (
          <div>
            {finalTrade.toFixed(8)} {this.props.to}
          </div>
        );
      } else {
        return (
          <div>
            <Text id="Exchange.TradeExceed" />
          </div>
        );
      }
    } else {
      return (
        <div>
          <Text id="Exchange.TradeUnMet" />
        </div>
      );
    }
  }

  /**
   * Build the confirmation modal
   *
   * @returns
   * @memberof Fast
   */
  buildConfermation() {
    if (
      this.props.to &&
      this.props.from &&
      this.props.from !== this.props.to
      //  &&
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
            {this.buttonOrNoButton()}
          </div>
        );
      } else {
        return (
          <h1>
            <Text id="Exchange.Exchange.NotAvailible" />.
          </h1>
        );
      }
    } else return null;
  }

  /**
   * Build out the button to allow the user to trade
   *
   * @returns
   * @memberof Fast
   */
  buttonOrNoButton() {
    if (
      true
      // this.props.withinBounds &&
      // this.props.toAddress &&
      // this.props.refundAddress
    ) {
      return (
        <button
          className="button primary hero"
          onClick={() => {
            this.executeTrade();
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
    } else return null;
  }

  /**
   * Return the currency lable
   *
   * @returns
   * @memberof Fast
   */
  currencylabel() {
    return this.props.to ? this.props.availableCoins[this.props.to].name : null;
  }

  /**
   * Execute the trade
   *
   * @memberof Fast
   */
  executeTrade() {
    this.props.ToggleAcyncButtons();
    // if (this.props.loggedIn && this.props.from === "NXS") {
    googleanalytics.SendEvent('Shapeshift', 'Fast', 'Sent', 1);
    if (this.props.withinBounds) {
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
                  {
                    UIController.showNotification(
                      `${res.error}\n ${this.props.to} Address.`,
                      'error'
                    );
                  }
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
                          this.props.InitiateFastTransaction(
                            this.props.toAddress,
                            this.props.refundAddress,
                            pair
                          );
                        }
                      }
                    }
                  );
                }
              }
            }
          );
        } else {
          UIController.showNotification('Refund Address is required', 'error');
        }
      } else {
        UIController.showNotification(
          `${this.currencylabel()} Address is required`,
          'error'
        );
      }
    } else {
      UIController.showNotification('Outside trade-able ammounts', 'error');
    }
    // } else alert("Please unlock your wallet");

    this.props.ToggleAcyncButtons();
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
)(Fast);
