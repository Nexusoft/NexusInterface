/*
  Title: 
  Description: 
  Last Modified by: Brian Smith
*/
// External Dependencies
import React, { Component } from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router";

// Internal Dependencies
import core from "../../api/core";
import styles from "./style.css";
import * as RPC from "../../script/rpc";
import * as TYPE from "../../actions/actiontypes";

// React-Redux mandatory methods
const mapStateToProps = state => {
  return {
    ...state.common,
    ...state.login,
    ...state.overview
  };
};
const mapDispatchToProps = dispatch => ({
  wipe: () => dispatch({ type: TYPE.WIPE_LOGIN_INFO }),
  busy: setting => dispatch({ type: TYPE.TOGGLE_BUSY_FLAG, payload: setting }),
  OpenModal: type => {
    dispatch({ type: TYPE.SHOW_MODAL, payload: type });
  }
});

class Unencrypted extends Component {
  // React Method (Life cycle hook)
  componentWillUnmount() {
    this.props.wipe();
  }

  // Class Methods
  showPrivKey(e) {
    e.preventDefault();
    let addressInput = document.getElementById("privKeyAddress");
    let address = addressInput.value;
    let output = document.getElementById("privKeyOutput");
    if (address) {
      RPC.PROMISE("dumpprivkey", [address]).then(payload => {
        output.value = payload;
      });
    } else {
      addressInput.focus();
    }
  }
  coreRestart() {
    core.restart();
  }

  encryptCallback() {
    alert("Wallet Encrypted. Restarting wallet...");
    this.coreRestart();
  }

  importPrivKey(e) {
    e.preventDefault();
    let acctname = document.getElementById("acctName");
    let label = acctname.value.trim();
    let privateKeyInput = document.getElementById("privateKey");
    let pk = privateKeyInput.value.trim();

    if (label && pk) {
      RPC.PROMISE("importprivkey", [pk], [label]).then(payload => {
        RPC.GET("rescan");
      });
    } else if (!label) {
      acctname.focus();
    } else if (!pk) {
      privateKeyInput.focus();
    }
  }

  copyPrivkey(e) {
    e.preventDefault();
    let output = document.getElementById("privKeyOutput");
    output.type = "text";
    output.focus();
    output.select();
    document.execCommand("Copy", false, null);
    output.type = "password";
  }

  reEnterValidator(e) {
    let newPass = document.getElementById("newPass");
    let passHint = document.getElementById("passHint");

    if (e.target.value === newPass.value) {
      e.preventDefault();
      passHint.style.visibility = "hidden";
    } else if (e.target.value.length === newPass.value.length) {
      if (passHint.innerText !== "Passwords do not match") {
        passHint.innerText = "Passwords do not match";
      }
      passHint.style.visibility = "visible";
    } else {
      passHint.style.visibility = "hidden";
    }
  }

  encrypt(e) {
    e.preventDefault();
    let newPass = document.getElementById("newPass");
    let passChk = document.getElementById("passChk");
    let passHint = document.getElementById("passHint");

    passHint.innerText = "Passwords do not match";
    if (newPass.value.trim()) {
      if (!/[-$/&*|<>]/.test(newPass.value)) {
        if (newPass.value === passChk.value) {
          if (!(newPass.value.endsWith(" ") || newPass.value.startsWith(" "))) {
            RPC.PROMISE("encryptwallet", [newPass.value]).then(payload => {
              if (payload === null) {
                pass.value = "";
                newPass.value = "";
                passChk.value = "";
                this.props.busy(false);
                this.props.OpenModal("Wallet has been encrypted.");
                this.props.history.push();
                // Start the daemon again... give it maybe 5 seconds.
              }
            });
          } else {
            passChk.value = "";
            passHint.innerText = "Password cannot start or end with spaces";
            passChk.focus();
          }
        } else {
          passChk.value = "";
          passHint.innerText = "Passwords do not match";
          passChk.focus();
        }
      } else {
        passChk.value = "";
        passHint.style.visibility = "visible";
        passHint.innerText = "Passwords cannot contain -$/&*|<>";
        passChk.focus();
      }
    } else {
      pass.focus();
    }
  }

  // Mandatory React method
  render() {
    if (this.props.connections === undefined) {
      return <h2>Please wait for the daemon to load</h2>;
    } else {
      return (
        <div id="securitylogin">
          <div className="securitySubContainer">
            <form>
              <fieldset>
                <legend>Encrypt Wallet</legend>
                <div style={{ marginTop: "26px" }} className="note">
                  Password cannot contain these characters {`-$/&*|<>`}
                </div>
                <div className="field">
                  <label>Password:</label>
                  <input
                    type="password"
                    placeholder="New Password"
                    id="newPass"
                    required
                  />
                  {/* className="hint" */}
                </div>
                <div className="field">
                  <label>Re-Enter Password:</label>
                  <input
                    type="password"
                    placeholder="Re-Enter Password"
                    id="passChk"
                    onChange={e => this.reEnterValidator(e)}
                  />
                  <span
                    id="passHint"
                    style={{ visibility: "hidden" }}
                    className="err invalid"
                  >
                    Passwords do not match
                  </span>
                </div>
                <p>
                  <button
                    style={{ width: "100%", margin: "0" }}
                    disabled={this.props.busyFlag}
                    className="button primary"
                    onClick={e => this.encrypt(e)}
                  >
                    Encrypt and Restart
                  </button>
                </p>
              </fieldset>
            </form>
          </div>
          <div className="securitySubContainer privKey">
            <form>
              <fieldset>
                <legend>View private key for address</legend>

                <div className="field">
                  <label>Address:</label>
                  <div className="expander">
                    <input
                      type="text"
                      id="privKeyAddress"
                      placeholder="Enter Address Here"
                      required
                    />
                    <button
                      disabled={this.props.busyFlag}
                      className="button primary"
                      onClick={e => this.showPrivKey(e)}
                    >
                      Submit
                    </button>
                  </div>
                </div>

                <div className="field">
                  <label>Private Key:</label>
                  <div className="expander">
                    <input type="password" id="privKeyOutput" />
                    <button
                      disabled={this.props.busyFlag}
                      className="button"
                      onClick={e => this.copyPrivkey(e)}
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </fieldset>
            </form>
          </div>
          <div className="securitySubContainer privKey">
            <form>
              <fieldset>
                <legend>Import Private Key</legend>
                <div className="field">
                  <label>Account Name:</label>
                  <div className="expander">
                    <input
                      type="Text"
                      placeholder="Account Name"
                      id="acctName"
                      required
                    />
                  </div>
                </div>
                <div className="field">
                  <label>Private Key:</label>
                  <div className="expander">
                    <input
                      type="password"
                      placeholder="Private Key"
                      id="privateKey"
                      required
                    />
                  </div>
                </div>
                <p>
                  <button
                    disabled={this.props.busyFlag}
                    className="button primary"
                    onClick={e => this.importPrivKey(e)}
                  >
                    Submit
                  </button>
                </p>
              </fieldset>
            </form>
          </div>
        </div>
      );
    }
  }
}

// Mandatory React-Redux method
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Unencrypted);
