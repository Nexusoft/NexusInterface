// External Dependencies
import React, { Component } from 'react';
import { connect } from 'react-redux';

// Internal Dependencies
import * as TYPE from 'consts/actionTypes';
import { showNotification } from 'actions/overlays';

// React-Redux mandatory methods
const mapStateToProps = state => {
  return {
    ...state.market,
  };
};
const actionCreators = {
  setTradeVol: TV => ({ type: TYPE.SET_TRADEVOL, payload: TV }),
  setThershold: TH => ({ type: TYPE.SET_THRESHOLD, payload: TH }),
  OpenModal: type => {
    ({ type: TYPE.SHOW_MODAL, payload: type });
  },
  showNotification,
};

/**
 * Settings for Market in the Settings Page
 *
 * @class SettingsMarket
 * @extends {Component}
 */
class SettingsMarket extends Component {
  // Class methods
  /**
   * Set Feedback
   *
   */
  feedback() {
    this.props.showNotification(<Text id="Alert.SettingsSaved" />, 'success');
  }
  // Mandatory React method
  /**
   * Component's Renderable JSX
   *
   * @returns
   */
  render() {
    return (
      <div id="SettingsMarket">
        {' '}
        <form>
          <fieldset>
            <legend>Arbitrage Alert Settings</legend>

            <div className="field">
              <label>Trade Volume:</label>
              <input
                type="number"
                // placeholder="500 NXS"
                onChange={e =>
                  this.props.setTradeVol(parseFloat(e.target.value))
                }
                value={this.props.tradeVolume}
              />
              <span className="hint">
                Volume of NXS you would like to calculate arbitrage for
              </span>
            </div>

            <div className="field">
              <label>BTC Profit Threshold:</label>
              <input
                type="number"
                // placeholder="0.000251 BTC"
                value={this.props.threshold}
                onChange={e =>
                  this.props.setThershold(parseFloat(e.target.value))
                }
              />
              <span className="hint">
                Threshold of profit to trigger an arbitrage alert
              </span>
            </div>
            <button onClick={() => this.feedback()} className="button primary">
              Submit
            </button>
          </fieldset>
        </form>
      </div>
    );
  }
}

// Mandatory React-Redux method
export default connect(
  mapStateToProps,
  actionCreators
)(SettingsMarket);
