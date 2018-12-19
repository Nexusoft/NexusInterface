// External Dependencies
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import Modal from 'react-responsive-modal';
import { FormattedMessage } from 'react-intl';
import { remote } from 'electron';
import { access } from 'fs';

// Internal Global Dependencies
import * as RPC from 'scripts/rpc';
import * as TYPE from 'actions/actiontypes';
import ContextMenuBuilder from 'contextmenu';
import Icon from 'components/common/Icon';
import Panel from 'components/common/Panel';
import Button from 'components/common/Button';
import TextBox, { WrappedTextBox } from 'components/common/TextBox';
import ComboBox from 'components/common/ComboBox';
import WaitingText from 'components/common/WaitingText';

// Internal Local Dependencies
import AddressModal from './AddressModal';
import MoveBetweenAccountsModal from './MoveBetweenAccountsModal';
import styles from './style.css';

// Resources
import sendIcon from 'images/send.sprite.svg';
import plusimg from 'images/plus.svg';
import trashimg from 'images/trash.svg';
import swapIcon from 'images/swap.sprite.svg';
import addressBookIcon from 'images/address-book.sprite.svg';

const mapStateToProps = state => {
  return {
    ...state.common,
    ...state.transactions,
    ...state.sendRecieve,
    ...state.overview,
    ...state.addressbook,
    ...state.settings,
    ...state.intl,
  };
};

const mapDispatchToProps = dispatch => ({
  SetSendAgainData: returnData => {
    dispatch({ type: TYPE.SET_TRANSACTION_SENDAGAIN, payload: returnData });
  },
  updateAddress: returnAddress => {
    dispatch({ type: TYPE.UPDATE_ADDRESS, payload: returnAddress });
  },
  SearchName: returnSearch => {
    dispatch({ type: TYPE.SEARCH, payload: returnSearch });
  },
  clearQueue: () => {
    dispatch({ type: TYPE.CLEAR_QUEUE });
  },
  clearForm: () => {
    dispatch({ type: TYPE.CLEAR_FORM });
  },
  clearSearch: () => {
    dispatch({ type: TYPE.CLEAR_SEARCHBAR });
  },
  addToQueue: returnQueue => {
    dispatch({ type: TYPE.ADD_TO_QUEUE, payload: returnQueue });
  },
  updateAmount: (NxsVal, USD) => {
    dispatch({
      type: TYPE.UPDATE_AMOUNT,
      payload: { USDAmount: USD, Amount: NxsVal },
    });
  },
  updateMoveAmount: (NxsVal, USD) => {
    dispatch({
      type: TYPE.UPDATE_MOVE_AMOUNT,
      payload: { USDAmount: USD, Amount: NxsVal },
    });
  },
  AccountPicked: returnSelectedAccount => {
    dispatch({ type: TYPE.SELECTED_ACCOUNT, payload: returnSelectedAccount });
  },
  changeAccount: returnAccountChanger => {
    dispatch({ type: TYPE.CHANGE_ACCOUNT, payload: returnAccountChanger });
  },
  updateMessage: returnMessage => {
    dispatch({ type: TYPE.UPDATE_MESSAGE, payload: returnMessage });
  },
  updateAccount: returnAccount => {
    dispatch({ type: TYPE.UPDATE_ACCOUNT_NAME, payload: returnAccount });
  },
  removeQueue: returnQueue => {
    dispatch({ type: TYPE.REMOVE_FROM_QUEUE, payload: returnQueue });
  },
  busy: () => {
    dispatch({ type: TYPE.TOGGLE_BUSY_FLAG });
  },
  OpenModal: type => {
    dispatch({ type: TYPE.SHOW_MODAL, payload: type });
  },
  CloseModal: type => {
    dispatch({ type: TYPE.HIDE_MODAL, payload: type });
  },
  OpenModal2: type => {
    dispatch({ type: TYPE.SHOW_MODAL2, payload: type });
  },
  CloseModal2: type => {
    dispatch({ type: TYPE.HIDE_MODAL2, payload: type });
  },
  OpenModal3: type => {
    dispatch({ type: TYPE.SHOW_MODAL3, payload: type });
  },
  CloseModal3: type => {
    dispatch({ type: TYPE.HIDE_MODAL3, payload: type });
  },
  OpenModal4: type => {
    dispatch({ type: TYPE.SHOW_MODAL4, payload: type });
  },
  CloseModal4: type => {
    dispatch({ type: TYPE.HIDE_MODAL4, payload: type });
  },
  OpenErrorModal: type => {
    dispatch({ type: TYPE.SHOW_ERROR_MODAL, payload: type });
  },
  CloseErrorModal: type => {
    dispatch({ type: TYPE.HIDE_ERROR_MODAL, payload: type });
  },
  Confirm: Answer => {
    dispatch({ type: TYPE.CONFIRM, payload: Answer });
  },
  OpenMoveModal: () => {
    dispatch({ type: TYPE.OPEN_MOVE_MODAL });
  },
  CloseMoveModal: () => {
    dispatch({ type: TYPE.CLOSE_MOVE_MODAL });
  },
  updateMoveToAccount: toAccount => {
    dispatch({ type: TYPE.MOVE_TO_ACCOUNT, payload: toAccount });
  },
  updateMoveFromAccount: fromAccount => {
    dispatch({ type: TYPE.MOVE_FROM_ACCOUNT, payload: fromAccount });
  },
});

class SendRecieve extends Component {
  componentDidMount() {
    window.addEventListener('contextmenu', this.setupcontextmenu, false);
    this.getAccountData();
    this.props.googleanalytics.SendScreen('Send');
  }
  getAccountData() {
    RPC.PROMISE('listaccounts').then(payload => {
      let listOfAccts = Object.entries(payload).map(e => {
        return {
          name: e[0],
          val: e[1],
        };
      });

      this.props.changeAccount(listOfAccts);
    });
  }
  loadMyAccounts() {
    RPC.PROMISE('listaccounts', [0]).then(payload => {
      Promise.all(
        Object.keys(payload).map(account =>
          RPC.PROMISE('getaddressesbyaccount', [account])
        )
      ).then(payload => {
        let validateAddressPromises = [];

        payload.map(element => {
          element.addresses.map(address => {
            validateAddressPromises.push(
              RPC.PROMISE('validateaddress', [address])
            );
          });
        });

        Promise.all(validateAddressPromises).then(payload => {
          let accountsList = [];
          let myaccts = payload.map(e => {
            if (e.ismine && e.isvalid) {
              let index = accountsList.findIndex(ele => {
                if (ele.account === e.account) {
                  return ele;
                }
              });
              let indexDefault = accountsList.findIndex(ele => {
                if (ele.account == '' || ele.account == 'default') {
                  return ele;
                }
              });

              if (e.account === '' || e.account === 'default') {
                if (index === -1 && indexDefault === -1) {
                  accountsList.push({
                    account: 'default',
                    addresses: [e.address],
                  });
                } else {
                  accountsList[indexDefault].addresses.push(e.address);
                }
              } else {
                if (index === -1) {
                  accountsList.push({
                    account: e.account,
                    addresses: [e.address],
                  });
                } else {
                  accountsList[index].addresses.push(e.address);
                }
              }
            }
          });

          this.props.MyAccountsList(accountsList);
        });
      });
    });
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.connections === undefined &&
      this.props.connections !== undefined
    ) {
      this.getAccountData();
    }
  }

  // React Method (Life cycle hook)

  componentWillUnmount() {
    this.props.AccountPicked('');
    window.removeEventListener('contextmenu', this.setupcontextmenu);
  }

  setupcontextmenu(e) {
    e.preventDefault();
    const contextmenu = new ContextMenuBuilder().defaultContext;
    //build default
    let defaultcontextmenu = remote.Menu.buildFromTemplate(contextmenu);
    defaultcontextmenu.popup(remote.getCurrentWindow());
  }

  editQueue() {
    if (Object.keys(this.props.Queue).includes(this.props.Address)) {
      return (
        <button
          className="button large"
          onClick={() => {
            this.props.OpenModal2('Edit Entry?');
          }}
        >
          <FormattedMessage
            id="sendReceive.EditQueue"
            defaultMessage="Edit Entry"
          />
        </button>
      );
    } else {
      return (
        <Button
          default
          name="Add To Queue"
          onClick={() => this.validateAddToQueue()}
        >
          <FormattedMessage
            id="sendReceive.AddToQueue"
            defaultMessage="Add To Queue"
          />
        </Button>
      );
    }
  }

  nxsAmount(e, isNxs) {
    if (/^[0-9.]+$/.test(e.target.value) | (e.target.value === '')) {
      if (isNxs) {
        let Usd = e.target.value * this.calculateUSDvalue();
        this.props.updateAmount(e.target.value, Usd.toFixed(2));
      } else {
        let NxsValue = e.target.value / this.calculateUSDvalue();
        this.props.updateAmount(NxsValue.toFixed(5), e.target.value);
      }
    } else {
      return null;
    }
  }

  accHud() {
    if (this.props.SelectedAccount === '') {
      return (
        <FormattedMessage
          id="sendReceive.MyAccount"
          defaultMessage="My Account"
        />
      );
    } else {
      return this.props.SelectedAccount;
    }
  }

  accountChanger() {
    if (this.props.AccountChanger) {
      return this.props.AccountChanger.map(e => ({
        value: e.name,
        display: `${e.name}: ${e.val}NXS`,
      }));
    }
    return [];
  }

  sendOne() {
    console.log('Send');
    this.props.busy();
    if (this.props.SelectedAccount !== '') {
      if (this.props.Address !== '' && this.props.Amount > 0) {
        RPC.PROMISE('validateaddress', [this.props.Address])
          .then(payload => {
            if (payload.isvalid) {
              if (!payload.ismine) {
                if (this.props.Message) {
                  RPC.PROMISE('sendfrom', [
                    this.props.SelectedAccount,
                    this.props.Address,
                    parseFloat(this.props.Amount),
                    parseInt(this.props.settings.minimumconfirmations),
                    this.props.Message,
                  ])
                    .then(payload => {
                      this.getAccountData();
                      this.props.OpenModal('send');
                      this.props.clearForm();
                      this.props.busy();
                    })
                    .catch(e => {
                      console.log(e);
                      this.props.busy();
                      this.props.OpenErrorModal(e);
                    });
                } else {
                  RPC.PROMISE('sendfrom', [
                    this.props.SelectedAccount,
                    this.props.Address,
                    parseFloat(this.props.Amount),
                    parseInt(this.props.settings.minimumconfirmations),
                  ])
                    .then(payoad => {
                      this.getAccountData();
                      this.props.OpenModal('send');
                      this.props.clearForm();
                      this.props.busy();
                    })
                    .catch(e => {
                      console.log(e);
                      this.props.busy();
                      this.props.OpenErrorModal(e);
                    });
                }
              } else {
                this.props.busy();
                this.props.OpenErrorModal(
                  'This is an address registered to this wallet'
                );
              }
            } else {
              this.props.busy();
              this.props.OpenErrorModal('Invalid Address');
            }
          })
          .catch(e => {
            this.props.busy();
            this.props.OpenErrorModal('Invalid Address');
          });
      } else {
        this.props.busy();
      }
    } else {
      this.props.OpenErrorModal('No Account Selected');
    }
  }

  sendMany() {
    this.props.busy();
    let keyCheck = Object.keys(this.props.Queue);
    if (this.props.SelectedAccount !== '') {
      if (keyCheck.length > 1) {
        RPC.PROMISE(
          'sendmany',
          [this.props.SelectedAccount, this.props.Queue],
          parseInt(this.props.settings.minimumconfirmations),
          this.props.Message
        )
          .then(payoad => {
            this.props.OpenModal('send');
            this.getAccountData();
            this.props.busy();
            this.props.clearForm();
            this.props.clearQueue();
          })
          .catch(e => {
            this.props.busy();
            this.props.OpenErrorModal(e);
          });
      } else if (Object.values(this.props.Queue)[0] > 0) {
        if (this.props.Message) {
          RPC.PROMISE('sendfrom', [
            this.props.SelectedAccount,
            keyCheck[0],
            parseFloat(Object.values(this.props.Queue)[0]),
            parseInt(this.props.settings.minimumconfirmations),
            this.props.Message,
          ])
            .then(payload => {
              this.getAccountData();
              this.props.OpenModal('send');
              this.props.clearForm();
              this.props.clearQueue();
              this.props.busy();
            })
            .catch(e => {
              console.log(e);
              this.props.busy();
              this.props.OpenErrorModal(e);
            });
        } else {
          RPC.PROMISE('sendfrom', [
            this.props.SelectedAccount,
            keyCheck[0],
            parseFloat(Object.values(this.props.Queue)[0]),
            parseInt(this.props.settings.minimumconfirmations),
          ])
            .then(payoad => {
              this.getAccountData();
              this.props.OpenModal('send');
              this.props.clearForm();
              this.props.clearQueue();
              this.props.busy();
            })
            .catch(e => {
              console.log(e);
              this.props.busy();
              this.props.OpenErrorModal(e);
            });
        }
      }
    } else {
      this.props.OpenErrorModal('No Account Selected');
    }
  }

  addAmount() {
    let keyCheck = Object.keys(this.props.Queue);
    if (keyCheck.length > 0) {
      let sum = Object.values(this.props.Queue).reduce((acc, val) => {
        return acc + val;
      });
      return (
        <div id="summary">
          <div>
            <FormattedMessage id="sendReceive.Total" defaultMessage="TOTAL" />:{' '}
            {''}
            {sum.toFixed(5)} NXS
          </div>

          {this.props.paytxfee && (
            <div>
              <FormattedMessage id="sendReceive.FEE" defaultMessage="FEE" />:{' '}
              {this.props.paytxfee.toFixed(5)} NXS
            </div>
          )}

          <div>
            <FormattedMessage id="sendReceive.From" defaultMessage="FROM" />:{' '}
            {this.accHud(this.props.SelectedAccount)}
          </div>
        </div>
      );
    }
  }
  validateAddToQueue() {
    if (!(this.props.Address === '') && this.props.Amount > 0) {
      RPC.PROMISE('validateaddress', [this.props.Address])
        .then(payload => {
          if (payload.isvalid) {
            if (!payload.ismine) {
              this.props.addToQueue({
                address: this.props.Address,
                amount: parseFloat(this.props.Amount),
              });
            } else {
              this.props.OpenErrorModal(
                'This is an address registered to this wallet'
              );
            }
          } else {
            this.props.OpenErrorModal('Invalid Address');
          }
        })
        .catch(e => {
          this.props.OpenErrorModal('Invalid Address');
        });
    }
  }

  calculateUSDvalue() {
    if (this.props.rawNXSvalues[0]) {
      let selectedCurrancyValue = this.props.rawNXSvalues.filter(ele => {
        if (ele.name === this.props.settings.fiatCurrency) {
          return ele;
        }
      });
      let currencyValue = selectedCurrancyValue[0].price;
      if (currencyValue === 0) {
        currencyValue = `${currencyValue}.00`;
      } else {
        currencyValue = currencyValue.toFixed(2);
      }

      return currencyValue;
    } else {
      return 0;
    }
  }

  fillQueue() {
    let Keys = Object.keys(this.props.Queue);
    let values = Object.values(this.props.Queue);
    let queueArray = Keys.map((e, i) => {
      let newObj = {
        key: e,
        val: values[i],
      };

      return newObj;
    });

    return queueArray.map((e, i) => {
      return (
        <tr key={i}>
          <td className="td" onClick={() => this.props.updateAddress(e.key)}>
            <span className="tooltip ">
              <FormattedMessage
                id="sendReceive.ClickToEdit"
                defaultMessage="Click To Edit"
              />
            </span>
            {e.key}
          </td>
          <td className="td">{e.val.toFixed(5)}</td>
          <td className="td">
            <img
              id="Remove"
              src={trashimg}
              onClick={() => {
                this.props.OpenModal3();
              }}
            />
          </td>
          <Modal
            classNames={{ modal: 'custom-modal2', overlay: 'custom-overlay' }}
            showCloseIcon={false}
            open={this.props.openThirdModal}
            onClose={e => {
              e.preventDefault();
              this.props.CloseModal3();
            }}
            center
          >
            <div>
              {' '}
              <h2>
                <FormattedMessage
                  id="sendReceive.RemoveFromQueue"
                  defaultMessage="Remove From Queue"
                />
              </h2>
              <div id="ok-button">
                <FormattedMessage id="sendReceive.Yes">
                  {yes => (
                    <input
                      value={yes}
                      type="button"
                      className="button primary"
                      onClick={() => {
                        this.props.removeQueue(e.key);
                        this.props.CloseModal3();
                      }}
                    />
                  )}
                </FormattedMessage>
              </div>
              <div id="no-button">
                <FormattedMessage id="sendReceive.No" defaultMessage="No">
                  {no => (
                    <input
                      value={no}
                      type="button"
                      className="button"
                      onClick={() => {
                        this.props.CloseModal3();
                      }}
                    />
                  )}
                </FormattedMessage>
              </div>
            </div>
          </Modal>
        </tr>
      );
    });
  }

  MyAddressesTable() {
    let filteredAddress = this.props.myAccounts.filter(acct => {
      if (acct.account === 'default') {
        let dummie = 'My Account';
        return (
          dummie.toLowerCase().indexOf(this.props.Search.toLowerCase()) !== -1
        );
      } else {
        return (
          acct.account
            .toLowerCase()
            .indexOf(this.props.Search.toLowerCase()) !== -1
        );
      }
    });
    return (
      <div id="Addresstable-wraper">
        {filteredAddress.map((acct, i) => {
          return (
            <tr>
              <td key={acct + i} className="tdAccounts">
                {acct.account === 'default' ? (
                  <span>My Account</span>
                ) : (
                  acct.account
                )}
              </td>
              {acct.addresses.map(address => {
                return (
                  <td className="tdd" key={address + i}>
                    <span onClick={event => this.copyaddress(event)}>
                      {address}
                    </span>
                    <span key={address + i} className="tooltip ">
                      Click to copy
                    </span>
                  </td>
                );
              })}
            </tr>
          );
        })}
      </div>
    );
  }

  modalinternal2() {
    switch (this.props.SendReceiveModalType) {
      case 'send transaction?':
        return (
          <div>
            <h2>
              <FormattedMessage
                id="sendReceive.SendTransaction"
                defaultMessage="Send Transaction"
              />
            </h2>
            <div id="ok-button">
              <FormattedMessage id="sendReceive.Yes" defaultMessage="Yes">
                {corn => (
                  <input
                    value={corn}
                    type="button"
                    className="button primary"
                    onClick={() => {
                      this.sendOne();
                      this.props.CloseModal2();
                    }}
                  />
                )}
              </FormattedMessage>
            </div>
          </div>
        );
        break;
      case 'Clear Queue?':
        return (
          <div>
            <h2>
              <FormattedMessage
                id="sendReceive.ClearQueue"
                defaultMessage="Clear Queue?"
              />
            </h2>
            <div id="ok-button">
              <FormattedMessage id="sendReceive.Yes" defaultMessage="Yes">
                {yes => (
                  <input
                    value={yes}
                    type="button"
                    className="button primary"
                    onClick={() => {
                      this.props.clearQueue();
                      this.props.CloseModal2();
                    }}
                  />
                )}
              </FormattedMessage>
            </div>
          </div>
        );
        break;
      case 'Send Multiple?':
        return (
          <div>
            <h2>
              <FormattedMessage
                id="sendReceive.SendAllFrom"
                defaultMessage="Send All Transactions From: "
              >
                {/* Send All Transactions (Total: {this.areYouSure()}) From */}
              </FormattedMessage>

              {this.accHud()}
            </h2>
            <div id="ok-button">
              <FormattedMessage id="sendReceive.Yes" defaultMessage="Yes">
                {yes => (
                  <input
                    value={yes}
                    type="button"
                    className="button primary"
                    onClick={() => {
                      this.sendMany();
                      this.props.CloseModal2();
                    }}
                  />
                )}
              </FormattedMessage>
            </div>
          </div>
        );
        break;
      case 'Edit Entry?':
        return (
          <div>
            <h2>
              <FormattedMessage
                id="sendReceive.EditEntry"
                defaultMessage="Edit Entry"
              />
            </h2>
            <div id="ok-button">
              <FormattedMessage id="sendReceive.Yes" defaultMessage="Yes">
                {Yes => (
                  <input
                    value={Yes}
                    type="button"
                    className="button primary"
                    onClick={() => {
                      this.validateAddToQueue();
                      this.props.CloseModal2();
                    }}
                  />
                )}
              </FormattedMessage>
            </div>
          </div>
        );
        break;

      default:
        'Error';
        break;
    }
  }

  render() {
    ///THIS IS NOT THE RIGHT AREA, this is for auto completing when you press a transaction
    if (this.props.sendagain != undefined && this.props.sendagain != null) {
      this.props.SetSendAgainData(null);
    }

    return (
      <Panel
        icon={sendIcon}
        title={
          <FormattedMessage
            id="sendReceive.SendNexus"
            defaultMessage="Send Nexus"
          />
        }
        controls={
          !!this.props.connections && (
            <Button
              square
              primary
              className="relative"
              onClick={() => this.props.OpenMoveModal()}
            >
              <Icon icon={swapIcon} />
              <div className="tooltip bottom">
                <FormattedMessage
                  id="sendReceive.MoveNxsBetweenAccount"
                  defaultMessage="Move NXS between accounts"
                />
              </div>
            </Button>
          )
        }
      >
        <AddressModal {...this.props} />

        {/* CONFIRMATION MODAL */}
        <Modal
          center
          classNames={{ modal: 'custom-modal2', overlay: 'custom-overlay' }}
          showCloseIcon={false}
          open={this.props.openSecondModal}
          onClose={e => {
            e.preventDefault();
            this.props.CloseModal2();
          }}
        >
          {this.modalinternal2()}
          <div id="no-button">
            <FormattedMessage id="sendReceive.Cancel" defaultMessage="Cancel">
              {cancel => (
                <input
                  value={cancel}
                  className="button"
                  type="button"
                  onClick={() => {
                    this.props.CloseModal2();
                  }}
                />
              )}
            </FormattedMessage>
          </div>
        </Modal>

        <MoveBetweenAccountsModal
          calculateUSDvalue={this.calculateUSDvalue.bind(this)}
          getAccountData={this.getAccountData.bind(this)}
          accountChanger={this.accountChanger.bind(this)}
          {...this.props}
        />

        {this.props.isInSync === false ||
        this.props.connections === undefined ? (
          <WaitingText>
            <FormattedMessage
              id="TrustList.SyncMsg"
              defaultMessage="Please wait for the daemon to load"
            />
            ...
          </WaitingText>
        ) : (
          <div id="container">
            <div className="box1">
              <div className="field">
                <ComboBox
                  value={this.props.SelectedAccount}
                  onChange={this.props.AccountPicked}
                  options={[
                    {
                      value: '',
                      display: (
                        <FormattedMessage
                          id="sendReceive.SelectAnAccount"
                          defaultMessage="Select an Account"
                        />
                      ),
                    },
                    ...this.accountChanger(),
                  ]}
                />
                <div>
                  <label>
                    <FormattedMessage
                      id="sendReceive.Address"
                      defaultMessage="Nexus Address"
                    />
                  </label>
                  <FormattedMessage
                    id="sendReceive.Address"
                    defaultMessage="Nexus Address"
                  >
                    {placeholder => (
                      <WrappedTextBox
                        btnContent={
                          <>
                            <Icon icon={addressBookIcon} />
                            <div className="tooltip bottom">
                              <FormattedMessage
                                id="sendReceive.Lookup"
                                defaultMessage="Lookup Address"
                              />
                            </div>
                          </>
                        }
                        btnOnClick={() => {
                          this.props.clearSearch();
                          this.props.OpenModal4('Address Lookup');
                        }}
                        inputProps={{
                          type: 'text',
                          placeholder: placeholder,
                          value: this.props.Addressplaceholder,
                          onChange: e =>
                            this.props.updateAddress(e.target.value),
                          placeholder,
                          required: true,
                        }}
                      />
                    )}
                  </FormattedMessage>
                </div>
                <div>
                  <div className="convertor">
                    <label>
                      <FormattedMessage
                        id="sendReceive.Amount"
                        defaultMessage="Nexus Amount"
                      />
                    </label>
                    <label className="UsdConvertorLabel">
                      {this.props.settings.fiatCurrency}
                    </label>
                  </div>
                  <div className="convertor">
                    <TextBox
                      type="text"
                      placeholder="0.00000"
                      value={this.props.Amount}
                      onChange={e => this.nxsAmount(e, true)}
                      required
                    />{' '}
                    <label>=</label>
                    <TextBox
                      type="text"
                      placeholder="0.00"
                      value={this.props.USDAmount}
                      onChange={e => {
                        this.nxsAmount(e);
                      }}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label>
                    <FormattedMessage
                      id="sendReceive.Message"
                      defaultMessage="Message"
                    />
                  </label>
                  <FormattedMessage
                    id="sendReceive.EnterYourMessage"
                    defaultMessage="Enter Your Message"
                  >
                    {placeholder => (
                      <TextBox
                        multiline
                        value={this.props.Message}
                        onChange={e => this.props.updateMessage(e.target.value)}
                        name="message"
                        rows="5"
                        placeholder={placeholder}
                      />
                    )}
                  </FormattedMessage>
                </div>
                <div id="left-buttons">
                  {this.editQueue()}
                  <Button
                    style={{ marginLeft: 15 }}
                    onClick={() => {
                      console.log(this.props.encrypted, this.props.loggedIn);
                      if (
                        !(this.props.Address === '') &&
                        this.props.Amount > 0
                      ) {
                        if (
                          this.props.encrypted === false ||
                          this.props.loggedIn === true
                        ) {
                          this.props.OpenModal2('send transaction?');
                        } else {
                          this.props.OpenErrorModal('Wallet Locked');
                        }
                      } else if (this.props.Amount <= 0) {
                        this.props.OpenErrorModal('Invalid Amount');
                      } else {
                        this.props.OpenErrorModal('Invalid Address');
                      }
                    }}
                  >
                    <FormattedMessage
                      id="sendReceive.SendNow"
                      defaultMessage="Send Now"
                    />
                  </Button>
                </div>
              </div>
            </div>
            <div className="box2">
              <div id="table-wraper">
                <div className="label">
                  <label>
                    <FormattedMessage
                      id="sendReceive.Queue"
                      defaultMessage="Queue"
                    />
                  </label>
                </div>{' '}
                <table className="table">
                  <thead>
                    <tr className="thead">
                      <th>
                        <FormattedMessage
                          id="sendReceive.TableAddress"
                          defaultMessage="Address"
                        />
                      </th>
                      <th>
                        <FormattedMessage
                          id="sendReceive.TableAmount"
                          defaultMessage="Amount"
                        />
                      </th>
                      <th style={{ whiteSpace: 'nowrap' }}>
                        <FormattedMessage
                          id="sendReceive.Remove"
                          defaultMessage="Remove"
                        />
                      </th>
                    </tr>
                  </thead>
                  {this.fillQueue()}
                </table>
                <div className="foot">
                  <Button
                    primary
                    style={{ marginRight: 15 }}
                    type="reset"
                    onClick={() => {
                      console.log(this.props.encrypted, this.props.loggedIn);
                      if (
                        this.props.encrypted === false ||
                        this.props.loggedIn === true
                      ) {
                        if (Object.keys(this.props.Queue).length > 0) {
                          this.props.OpenModal2('Send Multiple?');
                        } else {
                          this.props.OpenErrorModal('Empty Queue!');
                        }
                      } else {
                        this.props.OpenErrorModal('Wallet Locked');
                      }
                    }}
                  >
                    <FormattedMessage
                      id="sendReceive.SendAll"
                      defaultMessage="SendAll"
                    />
                  </Button>

                  <Button
                    primary
                    type="button"
                    onClick={() => {
                      this.props.OpenModal2('Clear Queue?');
                    }}
                  >
                    <FormattedMessage
                      id="sendReceive.ClearQueue"
                      defaultMessage="Clear Queue"
                    />
                  </Button>

                  <div>
                    <div className="counter">{this.addAmount()} </div>
                  </div>
                </div>{' '}
              </div>{' '}
            </div>{' '}
          </div>
        )}
      </Panel>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SendRecieve);
