/*
  Title: 
  Description: 
  Last Modified by: Brian Smith
*/
// External Dependencies
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router';
import { remote } from 'electron';
// Internal Dependencies
import core from 'api/core';
import styles from './style.css';
import * as RPC from 'scripts/rpc';
import * as TYPE from 'actions/actiontypes';
import { FormattedMessage } from 'react-intl';

// React-Redux mandatory methods
const mapStateToProps = state => {
  return {
    ...state.common,
    ...state.login,
    ...state.overview,
  };
};
const mapDispatchToProps = dispatch => ({
  wipe: () => dispatch({ type: TYPE.WIPE_LOGIN_INFO }),
  busy: setting => dispatch({ type: TYPE.TOGGLE_BUSY_FLAG, payload: setting }),
  OpenModal: type => {
    dispatch({ type: TYPE.SHOW_MODAL, payload: type });
  },
  CloseModal: () => dispatch({ type: TYPE.HIDE_MODAL }),
  ResetForEncryptionRestart: () => dispatch({ type: TYPE.CLEAR_FOR_RESTART }),
  OpenErrorModal: type => {
    dispatch({ type: TYPE.SHOW_ERROR_MODAL, payload: type });
  },
  CloseErrorModal: type => {
    dispatch({ type: TYPE.HIDE_ERROR_MODAL, payload: type });
  },
});

class Unencrypted extends Component {
  // React Method (Life cycle hook)
  componentWillUnmount() {
    this.props.wipe();
  }

  // Class Methods
  showPrivKey(e) {
    e.preventDefault();
    let addressInput = document.getElementById('privKeyAddress');
    let address = addressInput.value.trim();
    let output = document.getElementById('privKeyOutput');
    if (address) {
      RPC.PROMISE('dumpprivkey', [address])
        .then(payload => {
          output.value = payload;
        })
        .catch(e => {
          if (e.includes(address)) {
            e = e.replace(address + ' ', '');
          }
          this.props.OpenErrorModal(e);
          setTimeout(() => {
            this.props.CloseModal();
          }, 3000);
        });
    } else {
      addressInput.focus();
    }
  }

  importPrivKey(e) {
    e.preventDefault();
    let acctname = document.getElementById('acctName');
    let label = acctname.value.trim();
    let privateKeyInput = document.getElementById('privateKey');
    let pk = privateKeyInput.value.trim();

    if (label && pk) {
      RPC.PROMISE('importprivkey', [pk], [label])
        .then(payload => {
          this.props.ResetForEncryptionRestart();
          this.props.OpenModal('Private key imported rescanning now'); // new alert
          RPC.PROMISE('rescan')
            .then(payload => {
              this.props.CloseModal();
            })
            .catch(e => {
              this.props.OpenErrorModal(e);
              setTimeout(() => {
                this.props.CloseModal();
              }, 3000);
            });
        })
        .catch(e => {
          this.props.OpenErrorModal(e);
          setTimeout(() => {
            this.props.CloseModal();
          }, 3000);
        });
    } else if (!label) {
      acctname.focus();
    } else if (!pk) {
      privateKeyInput.focus();
    }
  }

  copyPrivkey(e) {
    e.preventDefault();
    let output = document.getElementById('privKeyOutput');
    output.type = 'text';
    output.focus();
    output.select();
    document.execCommand('Copy', false, null);
    output.type = 'password';
    this.props.OpenModal('Copied');
    setTimeout(() => {
      this.props.CloseModal();
    }, 3000);
  }

  reEnterValidator(e) {
    let newPass = document.getElementById('newPass');
    let passHint = document.getElementById('passHint');

    if (e.target.value === newPass.value) {
      e.preventDefault();
      passHint.style.visibility = 'hidden';
    } else if (e.target.value.length === newPass.value.length) {
      if (passHint.innerText !== 'Passwords do not match') {
        passHint.innerText = 'Passwords do not match';
      }
      passHint.style.visibility = 'visible';
    } else {
      passHint.style.visibility = 'hidden';
    }
  }

  encrypt(e) {
    e.preventDefault();
    let newPass = document.getElementById('newPass');
    let passChk = document.getElementById('passChk');
    let passHint = document.getElementById('passHint');

    passHint.innerText = 'Passwords do not match';
    if (newPass.value.trim()) {
      if (!/[-$/&*|<>]/.test(newPass.value)) {
        if (newPass.value === passChk.value) {
          if (!(newPass.value.endsWith(' ') || newPass.value.startsWith(' '))) {
            RPC.PROMISE('encryptwallet', [newPass.value])
              .then(payload => {
                newPass.value = '';
                passChk.value = '';
                this.props.busy(false);
                this.props.OpenModal('Wallet has been encrypted'); // new alert
                this.props.ResetForEncryptionRestart();

                // Start the daemon again... give it maybe 5 seconds.
                setTimeout(() => {
                  this.props.CloseModal();
                  remote.getGlobal('core').start();
                  this.props.history.replace('/');
                }, 5000);
              })
              .catch(e => {
                this.props.OpenErrorModal(e);
              });
          } else {
            this.props.OpenErrorModal(
              'Password cannot start or end with spaces'
            ); // new alert
            passChk.focus();
          }
        } else {
          this.props.OpenErrorModal('Passwords do not match'); // new alert
          passChk.focus();
        }
      } else {
        this.props.OpenErrorModal('Passwords cannot contain -$/&*|<>'); // new alert
        passChk.focus();
      }
    } else {
      passChk.focus();
    }
  }

  // Mandatory React method
  render() {
    if (this.props.connections === undefined) {
      return (
        <h2>
          <FormattedMessage
            id="transactions.Loading"
            defaultMessage="Please wait for the Daemon to load"
          />
        </h2>
      );
    } else {
      return (
        <div id="securitylogin">
          <div className="securitySubContainer">
            <form>
              <fieldset>
                <legend>
                  <FormattedMessage
                    id="Settings.EncryptWallet"
                    defaultMessage="Encrypt Wallet"
                  />
                </legend>
                <div style={{ marginTop: '26px' }} className="note">
                  <FormattedMessage
                    id="Settings.CannotContain"
                    defaultMessage="Encrypt Wallet"
                  />{' '}
                  {`-$/&*|<>`}
                </div>
                <div className="field">
                  <label>
                    <FormattedMessage
                      id="Settings.Password"
                      defaultMessage="Password:"
                    />
                  </label>
                  <FormattedMessage
                    id="Settings.NewPassword"
                    defaultMessage="New Password:"
                  >
                    {p => (
                      <input
                        type="password"
                        placeholder={p}
                        id="newPass"
                        required
                      />
                    )}
                  </FormattedMessage>
                  {/* className="hint" */}
                </div>
                <div className="field">
                  <label>
                    <FormattedMessage
                      id="Settings.Re-Enter"
                      defaultMessage="Re-Enter Password"
                    />
                  </label>
                  <FormattedMessage
                    id="Settings.Re-Enter"
                    defaultMessage="Re-Enter Password"
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
                  <span
                    id="passHint"
                    style={{ visibility: 'hidden' }}
                    className="err invalid"
                  >
                    <FormattedMessage
                      id="Settings.Re-Enter"
                      defaultMessage="Re-Enter Password"
                    />
                  </span>
                </div>
                <p>
                  <button
                    style={{ width: '100%', margin: '0' }}
                    disabled={this.props.busyFlag}
                    className="button primary"
                    onClick={e => this.encrypt(e)}
                  >
                    <FormattedMessage
                      id="Settings.EncryptRestart"
                      defaultMessage="Encrypt and Restart"
                    />
                  </button>
                </p>
              </fieldset>
            </form>
          </div>
          <div className="securitySubContainer privKey">
            <form>
              <fieldset>
                <legend>
                  <FormattedMessage
                    id="Settings.ViewPrivateKey"
                    defaultMessage="View private key for address"
                  />
                </legend>

                <div className="field">
                  <label>
                    <FormattedMessage
                      id="Settings.Address"
                      defaultMessage="Address"
                    />
                    :
                  </label>
                  <div className="expander">
                    <FormattedMessage
                      id="Settings.EnterAddressHere"
                      defaultMessage="Enter Address Here"
                    >
                      {eah => (
                        <input
                          type="text"
                          id="privKeyAddress"
                          placeholder={eah}
                          required
                        />
                      )}
                    </FormattedMessage>
                    <button
                      disabled={this.props.busyFlag}
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
                      defaultMessage="Private Key"
                    />
                    :
                  </label>
                  <div className="expander">
                    <input type="password" id="privKeyOutput" />
                    <button
                      disabled={this.props.busyFlag}
                      className="button primary"
                      onClick={e => {
                        this.copyPrivkey(e);
                      }}
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
                      defaultMessage="Account Name"
                    />
                    :
                  </label>
                  <div className="expander">
                    <FormattedMessage
                      id="Settings.AccountName"
                      defaultMessage="Account"
                    >
                      {an => (
                        <input
                          type="Text"
                          placeholder={an}
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
                      defaultMessage="Private Key"
                    />
                    :
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
                      id="Settings.AccountName"
                      defaultMessage="Account"
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
}

// Mandatory React-Redux method
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Unencrypted);
