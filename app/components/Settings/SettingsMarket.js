import React, { Component } from "react";
import styles from "./style.css";
import { connect } from "react-redux";

import * as TYPE from "../../actions/actiontypes";
import * as RPC from "../../script/rpc";

const mapStateToProps = state => {
  return {
    ...state.market
  };
};

const mapDispatchToProps = dispatch => ({
  setTradeVol: TV => dispatch({ type: TYPE.SET_TRADEVOL, payload: TV }),
  setThershold: TH => dispatch({ type: TYPE.SET_THRESHOLD, payload: TH }),
  OpenModal: type => {
    dispatch({ type: TYPE.SHOW_MODAL, payload: type });
  }
});

class SettingsMarket extends Component {
  feedback() {
    this.props.OpenModal("Settings saved");
  }
  render() {
    return (
      <div id="SettingsMarket">
        {" "}
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
                Volume Of NXS you would like to calculate arbitrage for.
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
                Threshold of profit to trigger an Arbitrage Alert
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SettingsMarket);
