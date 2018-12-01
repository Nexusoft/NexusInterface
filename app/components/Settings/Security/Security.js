import React, { Component } from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router";

import styles from "./style.css";
import * as RPC from "scripts/rpc";
import * as TYPE from "actions/actiontypes";
import { FormattedMessage } from "react-intl";

const mapStateToProps = state => {
  return {
    ...state.common,
    ...state.login
  };
};

const mapDispatchToProps = dispatch => ({
  wipe: () => dispatch({ type: TYPE.WIPE_LOGIN_INFO }),
  busy: () => dispatch({ type: TYPE.TOGGLE_BUSY_FLAG }),
  OpenModal: type => dispatch({ type: TYPE.SHOW_MODAL, payload: type }),
  getInfo: payload => dispatch({ type: TYPE.GET_INFO_DUMP, payload: payload })
});

class Security extends Component {
  lockWallet() {
    this.props.busy();
    RPC.PROMISE("walletlock", []).then(payload => {
      this.props.wipe();
      this.props.busy();
      RPC.PROMISE("getinfo", [])
        .then(payload => {
          delete payload.timestamp;
          return payload;
        })
        .then(payload => {
          this.props.getInfo(payload);
        });
    });
  }
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

  changePassword(e) {
    e.preventDefault();
    let pass, newPass, passChk, passHint;
    pass = document.getElementById("oldPass");
    newPass = document.getElementById("newPass");
    passChk = document.getElementById("passChk");
    passHint = document.getElementById("passHint");
    if (pass.value.trim()) {
      if (/[-$&/*|<>]/.test(newPass.value)) {
        if (newPass.value === passChk.value) {
          if (!(newPass.value.endsWith(" ") || newPass.value.startsWith(" "))) {
            RPC.PROMISE("walletpassphrasechange", [
              pass.value,
              newPass.value
            ]).then(payload => {
              if (payload === null) {
                pass.value = "";
                newPass.value = "";
                passChk.value = "";
                this.props.OpenModal("Password has been changed.");
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
        passHint.innerText = "Passwords cannot contain -$&/*|<>";
        passChk.focus();
      }
    } else {
      passHint.innerText = "Passwords do not match";
      pass.focus();
    }
  }

  reEnterValidator(e) {
    let newPass = document.getElementById("newPass");
    let passHint = document.getElementById("passHint");
    if (e.target.value === newPass.value) {
      e.preventDefault();
      passHint.style.visibility = "hidden";
    } else {
      passHint.style.visibility = "visible";
    }
  }

  componentWillUnmount() {
    this.props.wipe();
  }
  render() {
    if (!this.props.loggedIn) {
      return (
        <Redirect to={this.props.match.path.replace("/Content", "/Security")} />
      );
    }
    return (
      <div id="securitylogin">
        <div className="securitySubContainer">
          <form>
            <fieldset>
              <legend>
                <FormattedMessage
                  id="Settings.ChangePassword"
                  defaultMessage="Change Password"
                />
              </legend>
              <div className="field">
                <label>
                  <FormattedMessage
                    id="Settings.PreviousPassword"
                    defaultMessage="Previous Password"
                  />
                </label>
                <FormattedMessage
                  id="Settings.Password"
                  defaultMessage="Password"
                >
                  {p => (
                    <input
                      type="password"
                      placeholder={p}
                      id="oldPass"
                      required
                    />
                  )}
                </FormattedMessage>
                <span className="hint">
                  <FormattedMessage
                    id="Settings.PasswordRequired"
                    defaultMessage="Password Is Required"
                  />
                </span>
              </div>
              <div className="field">
                <label>
                  <FormattedMessage
                    id="Settings.NewPassword"
                    defaultMessage="New Password"
                  />
                </label>
                <FormattedMessage
                  id="Settings.NewPassword"
                  defaultMessage="New Password"
                >
                  {np => (
                    <input
                      type="password"
                      placeholder={np}
                      id="newPass"
                      required
                    />
                  )}
                </FormattedMessage>
                <span className="hint">
                  <FormattedMessage
                    id="Settings.PasswordRequired"
                    defaultMessage="Password Is Required"
                  />
                </span>
              </div>
              <div className="field">
                <label>
                  <FormattedMessage
                    id="Settings.ReEnterPassword"
                    defaultMessage="Re-Enter Password:"
                  />
                </label>
                <FormattedMessage
                  id="Settings.ReEnterPassword"
                  defaultMessage="Re-Enter Password:"
                >
                  {rep => (
                    <input
                      type="password"
                      placeholder={rep}
                      id="passChk"
                      onChange={e => this.reEnterValidator(e)}
                    />
                  )}
                </FormattedMessage>
                <span id="passHint" className="err invalid">
                  <FormattedMessage
                    id="Settings.NoMatch"
                    defaultMessage="Passwords do not match"
                  />
                </span>
              </div>
              <p>
                <button
                  style={{ width: "100%", margin: "0" }}
                  // disabled={this.props.busyFlag}
                  className="button primary"
                  onClick={() => this.changePassword(e)}
                >
                  <FormattedMessage
                    id="Settings.Submit"
                    defaultMessage="Submit"
                  />
                </button>
              </p>
            </fieldset>
          </form>
          <button
            style={{ width: "100%", margin: "0" }}
            id="lockWallet"
            className="button primary"
            // disabled={this.props.busyFlag}
            onClick={e => {
              e.preventDefault();
              this.lockWallet();
            }}
          >
            <FormattedMessage
              id="Settings.LockWallet"
              defaultMessage="Lock Wallet"
            />
          </button>
        </div>
        <div className="securitySubContainer privKey">
          <form>
            <fieldset>
              <legend>
                {" "}
                <FormattedMessage
                  id="Settings.ViewPrivateKeyForAddress"
                  defaultMessage="View private key for address"
                />
              </legend>

              <div className="field">
                <label>
                  <FormattedMessage
                    id="Settings.Address"
                    defaultMessage="Address"
                  />
                </label>
                <div className="expander">
                  <input
                    type="text"
                    id="privKeyAddress"
                    placeholder="Enter Address Here"
                    required
                  />
                  <button
                    // disabled={this.props.busyFlag}
                    className="button primary"
                    onClick={e => this.showPrivKey(e)}
                  >
                    <FormattedMessage
                      id="Settings.Submit"
                      defaultMessage="Submit"
                    />
                  </button>
                </div>
              </div>

              <div className="field">
                <label>
                  <FormattedMessage
                    id="Settings.PrivateKey"
                    defaultMessage="Private Key:"
                  />
                </label>
                <div className="expander">
                  <input type="password" id="privKeyOutput" />
                  <button
                    // disabled={this.props.busyFlag}
                    className="button"
                    onClick={e => this.copyPrivkey(e)}
                  >
                    <FormattedMessage
                      id="Settings.Copy"
                      defaultMessage="Copy"
                    />
                  </button>
                </div>
              </div>
            </fieldset>
          </form>
        </div>
        <div className="securitySubContainer privKey">
          <form>
            <fieldset>
              <legend>
                <FormattedMessage
                  id="Settings.ImportPrivateKey"
                  defaultMessage="Import Private Key"
                />
              </legend>
              <div className="field">
                <label>
                  <FormattedMessage
                    id="Settings.AccountName"
                    defaultMessage="Account Name:"
                  />
                </label>
                <div className="expander">
                  <FormattedMessage
                    id="Settings.AccountName"
                    defaultMessage="Account Name"
                  >
                    {An => (
                      <input
                        type="Text"
                        placeholder={An}
                        id="acctName"
                        required
                      />
                    )}
                  </FormattedMessage>
                </div>
              </div>
              <div className="field">
                <label>
                  <FormattedMessage
                    id="Settings.PrivateKey"
                    defaultMessage="Account Name:"
                  />
                </label>
                <div className="expander">
                  <FormattedMessage
                    id="Settings.PrivateKey"
                    defaultMessage="Private Key"
                  >
                    {pk => (
                      <input
                        type="password"
                        placeholder={pk}
                        id="privateKey"
                        required
                      />
                    )}
                  </FormattedMessage>
                </div>
              </div>
              <p>
                <button
                  disabled={this.props.busyFlag}
                  className="button primary"
                  onClick={e => this.importPrivKey(e)}
                >
                  <FormattedMessage
                    id="Settings.Submit"
                    defaultMessage="Submit"
                  />
                </button>
              </p>
            </fieldset>
          </form>
        </div>
      </div>
    );
  }
}
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Security);
