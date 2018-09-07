import React, { Component } from "react";
import styles from "./style.css";
import { connect } from "react-redux";
import { Redirect } from "react-router";
import * as TYPE from "../../actions/actiontypes";
import * as RPC from "../../script/rpc";

const mapStateToProps = state => {
  return {
    ...state.common,
    ...state.login
  };
};

const mapDispatchToProps = dispatch => ({
  setDate: date => dispatch({ type: TYPE.SET_DATE, payload: date }),
  setErrorMessage: message =>
    dispatch({ type: TYPE.SET_ERROR_MESSAGE, payload: message }),
  wipe: () => dispatch({ type: TYPE.WIPE_LOGIN_INFO }),
  busy: () => dispatch({ type: TYPE.TOGGLE_BUSY_FLAG }),
  stake: () => dispatch({ type: TYPE.TOGGLE_STAKING_FLAG }),
  getInfo: payload => dispatch({ type: TYPE.GET_INFO_DUMP, payload: payload })
});

class Login extends Component {
  getMinDate() {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    let month = tomorrow.getMonth() + 1;
    if (month < 10) {
      month = "0" + month;
    }

    return `${tomorrow.getFullYear()}-${month}-${tomorrow.getDate()}`;
  }

  handleSubmit() {
    const unlockDate = new Date(this.props.unlockUntillDate);
    const pass = document.getElementById("pass");
    const today = new Date();
    let unlockUntill = Math.round(
      (unlockDate.getTime() - today.getTime()) / 1000
    );
    this.props.busy();
    RPC.PROMISE("walletpassphrase", [pass.value, unlockUntill, false])
      .then(payload => {
        this.props.wipe();

        RPC.PROMISE("getinfo", [])
          .then(payload => {
            delete payload.timestamp;
            return payload;
          })
          .then(payload => {
            // this.props.busy();
            this.props.getInfo(payload);
          });
      })
      .catch(e => {
        if (
          e.error.message ===
          "Error: The wallet passphrase entered was incorrect."
        ) {
          let message = e.error.message.replace("Error: ", "");
          this.props.setErrorMessage(message);
          pass.value = "";
          pass.focus();
        }
      });
  }

  render() {
    if (this.props.loggedIn) {
      return (
        <Redirect to={this.props.match.path.replace("/Login", "/Security")} />
      );
    }
    return (
      <div id="securitylogin">
        <form>
          <fieldset>
            <legend>Login</legend>
            <div className="field">
              <label>Unlock Untill:</label>
              <input
                type="date"
                min={this.getMinDate()}
                value={this.props.unlockUntillDate}
                onChange={e => this.props.setDate(e.target.value)}
                required
                style={{ width: "100%" }}
              />
              <span className="hint">Unlock untill date is required.</span>
            </div>

            <div className="field">
              <label>Password:</label>
              <input
                type="password"
                placeholder="Password"
                id="pass"
                required
              />
              <span className="hint">{this.props.errorMessage}</span>
            </div>

            {/* STAKING FLAG STUFF */}
            <div className="field" id="checkFeild">
              <label>Staking Only:</label>
              <input
                type="checkbox"
                className="switch"
                value={this.props.stakeFlag}
                onChange={() => this.props.stake()}
              />
            </div>
          </fieldset>

          <p>
            <input
              type="submit"
              className="button primary"
              onClick={e => {
                e.preventDefault();
                this.handleSubmit();
              }}
              // disabled={this.props.busyFlag}
            />
          </p>
        </form>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Login);
