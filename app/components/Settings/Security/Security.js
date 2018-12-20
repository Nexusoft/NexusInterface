// External
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router';
import { FormattedMessage } from 'react-intl';
import styled from '@emotion/styled';

// Internal
import styles from './style.css';
import * as RPC from 'scripts/rpc';
import * as TYPE from 'actions/actiontypes';
import FormField from 'components/common/FormField';
import TextBox from 'components/common/TextBox';
import Button from 'components/common/Button';
import FieldSet from 'components/common/FieldSet';
import Icon from 'components/common/Icon';
import copyIcon from 'images/copy.sprite.svg';

const SecuritySettings = styled.div({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  alignItems: 'flex-start',
});

const ChangePassword = styled.form({
  flex: 2,
});

const ImportPrivKey = styled.form({
  flex: 3,
  marginLeft: '1em',
});

const mapStateToProps = state => {
  return {
    ...state.common,
    ...state.login,
  };
};

const mapDispatchToProps = dispatch => ({
  wipe: () => dispatch({ type: TYPE.WIPE_LOGIN_INFO }),
  busy: () => dispatch({ type: TYPE.TOGGLE_BUSY_FLAG }),
  OpenModal: type => dispatch({ type: TYPE.SHOW_MODAL, payload: type }),
  getInfo: payload => dispatch({ type: TYPE.GET_INFO_DUMP, payload: payload }),
  OpenErrorModal: type => {
    dispatch({ type: TYPE.SHOW_ERROR_MODAL, payload: type });
  },
  CloseErrorModal: type => {
    dispatch({ type: TYPE.HIDE_ERROR_MODAL, payload: type });
  },
});

class Security extends Component {
  lockWallet() {
    this.props.busy();
    RPC.PROMISE('walletlock', [])
      .then(payload => {
        this.props.wipe();
        this.props.busy();
        RPC.PROMISE('getinfo', [])
          .then(payload => {
            delete payload.timestamp;
            return payload;
          })
          .then(payload => {
            this.props.getInfo(payload);
          });
      })
      .catch(e => {
        this.props.OpenErrorModal(e);
        setTimeout(() => {
          this.props.CloseModal();
        }, 3000);
      });
  }

  showPrivKey(e) {
    e.preventDefault();
    let addressInput = document.getElementById('privKeyAddress');
    let address = addressInput.value;
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

  changePassword(e) {
    e.preventDefault();
    let pass, newPass, passChk, passHint;
    pass = document.getElementById('oldPass');
    newPass = document.getElementById('newPass');
    passChk = document.getElementById('passChk');
    passHint = document.getElementById('passHint');
    if (pass.value.trim()) {
      if (/[-$&/*|<>]/.test(newPass.value)) {
        if (newPass.value === passChk.value) {
          if (!(newPass.value.endsWith(' ') || newPass.value.startsWith(' '))) {
            RPC.PROMISE('walletpassphrasechange', [
              pass.value,
              newPass.value,
            ]).then(payload => {
              if (payload === null) {
                pass.value = '';
                newPass.value = '';
                passChk.value = '';
                this.props.OpenModal('Password has been changed.');
              }
            });
          } else {
            passChk.value = '';
            passHint.innerText = 'Password cannot start or end with spaces';
            passChk.focus();
          }
        } else {
          passChk.value = '';
          passHint.innerText = 'Passwords do not match';
          passChk.focus();
        }
      } else {
        passChk.value = '';
        passHint.style.visibility = 'visible';
        passHint.innerText = 'Passwords cannot contain -$&/*|<>';
        passChk.focus();
      }
    } else {
      passHint.innerText = 'Passwords do not match';
      pass.focus();
    }
  }

  reEnterValidator(e) {
    let newPass = document.getElementById('newPass');
    let passHint = document.getElementById('passHint');
    if (e.target.value === newPass.value) {
      e.preventDefault();
      passHint.style.visibility = 'hidden';
    } else {
      passHint.style.visibility = 'visible';
    }
  }

  componentWillUnmount() {
    this.props.wipe();
  }
  render() {
    if (!this.props.loggedIn) {
      return (
        <Redirect to={this.props.match.path.replace('/Content', '/Security')} />
      );
    }
    return (
      <div>
        <SecuritySettings>
          <ChangePassword>
            <FieldSet
              legend={
                <FormattedMessage
                  id="Settings.ChangePassword"
                  defaultMessage="Change Password"
                />
              }
            >
              <FormField
                label={
                  <FormattedMessage
                    id="Settings.PreviousPassword"
                    defaultMessage="Previous Password"
                  />
                }
              >
                <FormattedMessage
                  id="Settings.Password"
                  defaultMessage="Password"
                >
                  {p => (
                    <TextBox
                      type="password"
                      placeholder={p}
                      id="oldPass"
                      required
                    />
                  )}
                </FormattedMessage>
              </FormField>
              <span className="hint">
                <FormattedMessage
                  id="Settings.PasswordRequired"
                  defaultMessage="Password Is Required"
                />
              </span>
              <FormField
                label={
                  <FormattedMessage
                    id="Settings.NewPassword"
                    defaultMessage="New Password"
                  />
                }
              >
                <FormattedMessage
                  id="Settings.NewPassword"
                  defaultMessage="New Password"
                >
                  {np => (
                    <TextBox
                      type="password"
                      placeholder={np}
                      id="newPass"
                      required
                    />
                  )}
                </FormattedMessage>
              </FormField>
              <span className="hint">
                <FormattedMessage
                  id="Settings.PasswordRequired"
                  defaultMessage="Password Is Required"
                />
              </span>
              <FormField
                label={
                  <FormattedMessage
                    id="Settings.ReEnterPassword"
                    defaultMessage="Re-Enter Password:"
                  />
                }
              >
                <FormattedMessage
                  id="Settings.ReEnterPassword"
                  defaultMessage="Re-Enter Password:"
                >
                  {rep => (
                    <TextBox
                      type="password"
                      placeholder={rep}
                      id="passChk"
                      onChange={e => this.reEnterValidator(e)}
                    />
                  )}
                </FormattedMessage>
              </FormField>
              <span id="passHint" className="err invalid">
                <FormattedMessage
                  id="Settings.NoMatch"
                  defaultMessage="Passwords do not match"
                />
              </span>

              <Button
                primary
                wide
                style={{ marginTop: '2em' }}
                onClick={() => this.changePassword(e)}
              >
                <FormattedMessage
                  id="Settings.Submit"
                  defaultMessage="Submit"
                />
              </Button>
            </FieldSet>
          </ChangePassword>

          <ImportPrivKey>
            <FieldSet
              legend={
                <FormattedMessage
                  id="Settings.ImportPrivateKey"
                  defaultMessage="Import Private Key"
                />
              }
            >
              <FormField
                label={
                  <FormattedMessage
                    id="Settings.AccountName"
                    defaultMessage="Account Name:"
                  />
                }
              >
                <FormattedMessage
                  id="Settings.AccountName"
                  defaultMessage="Account Name"
                >
                  {An => (
                    <TextBox
                      type="Text"
                      placeholder={An}
                      id="acctName"
                      required
                    />
                  )}
                </FormattedMessage>
              </FormField>
              <FormField
                label={
                  <FormattedMessage
                    id="Settings.PrivateKey"
                    defaultMessage="Account Name:"
                  />
                }
              >
                <FormattedMessage
                  id="Settings.PrivateKey"
                  defaultMessage="Private Key"
                >
                  {pk => (
                    <TextBox
                      type="password"
                      placeholder={pk}
                      id="privateKey"
                      required
                    />
                  )}
                </FormattedMessage>
              </FormField>
              <Button
                primary
                wide
                style={{ marginTop: '2em' }}
                disabled={this.props.busyFlag}
                onClick={e => this.importPrivKey(e)}
              >
                <FormattedMessage
                  id="Settings.Submit"
                  defaultMessage="Submit"
                />
              </Button>
            </FieldSet>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                filled
                darkGray
                onClick={e => {
                  e.preventDefault();
                  this.lockWallet();
                }}
              >
                <FormattedMessage
                  id="Settings.LockWallet"
                  defaultMessage="Lock Wallet"
                />
              </Button>
            </div>
          </ImportPrivKey>
        </SecuritySettings>

        <form>
          <FieldSet
            legend={
              <FormattedMessage
                id="Settings.ViewPrivateKeyForAddress"
                defaultMessage="View private key for address"
              />
            }
          >
            <FormField
              label={
                <FormattedMessage
                  id="Settings.Address"
                  defaultMessage="Address"
                />
              }
            >
              <div className="flex stretch">
                <TextBox
                  grouped="left"
                  id="privKeyAddress"
                  placeholder="Enter Address Here"
                  required
                />
                <Button
                  filled
                  primary
                  freeHeight
                  grouped="right"
                  onClick={e => this.showPrivKey(e)}
                >
                  Import
                </Button>
              </div>
            </FormField>

            <FormField
              label={
                <FormattedMessage
                  id="Settings.PrivateKey"
                  defaultMessage="Private Key:"
                />
              }
            >
              <div className="flex stretch">
                <TextBox grouped="left" type="password" id="privKeyOutput" />
                <Button
                  filled
                  light
                  freeHeight
                  grouped="right"
                  className="relative"
                  onClick={e => {
                    this.copyPrivkey(e);
                  }}
                >
                  <Icon icon={copyIcon} />
                  <div className="tooltip bottom">
                    <FormattedMessage
                      id="Settings.Copy"
                      defaultMessage="Copy"
                    />
                  </div>
                </Button>
              </div>
            </FormField>
          </FieldSet>
        </form>
      </div>
    );
  }
}
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Security);
