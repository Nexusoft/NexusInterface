// External Dependencies
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import Modal from 'react-responsive-modal';
import { FormattedMessage } from 'react-intl';
import { remote } from 'electron';
import { access } from 'fs';
import styled from '@emotion/styled';
import googleanalytics from 'scripts/googleanalytics';

// Internal Global Dependencies
import * as RPC from 'scripts/rpc';
import * as TYPE from 'actions/actiontypes';
import ContextMenuBuilder from 'contextmenu';
import Icon from 'components/common/Icon';
import Panel from 'components/common/Panel';
import Button from 'components/common/Button';
import TextField from 'components/common/TextField';
import ComboBox from 'components/common/ComboBox';
import WaitingText from 'components/common/WaitingText';
import FormField from 'components/common/FormField';
import InputGroup from 'components/common/InputGroup';

// Internal Local Dependencies
import AddressModal from './AddressModal';
import ConfirmationModal from './ConfirmationModal';
import MoveBetweenAccountsModal from './MoveBetweenAccountsModal';
import Queue from './Queue';
import styles from './style.css';

// Resources
import sendIcon from 'images/send.sprite.svg';
import plusimg from 'images/plus.svg';
import swapIcon from 'images/swap.sprite.svg';
import addressBookIcon from 'images/address-book.sprite.svg';

const SendForm = styled.div({
  maxWidth: 600,
  margin: '0 auto',
});

const SendAmount = styled.div({
  display: 'flex',
});

const SendAmountField = styled.div({
  flex: 1,
});

const SendAmountEqual = styled.div({
  display: 'flex',
  alignItems: 'flex-end',
  padding: '.1em .6em',
  fontSize: '1.2em',
});

const SendFormButtons = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: '2em',
});

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
    googleanalytics.SendScreen('Send');
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
        <Button
          onClick={() => {
            this.props.OpenModal2('Edit Entry?');
          }}
        >
          <FormattedMessage
            id="sendReceive.EditQueue"
            defaultMessage="Edit Entry"
          />
        </Button>
      );
    } else {
      return (
        <Button onClick={() => this.validateAddToQueue()}>
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
        display: `${e.name} (${e.val} NXS)`,
      }));
    }
    return [];
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
              skin="primary"
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

        <ConfirmationModal
          accHud={this.accHud.bind(this)}
          getAccountData={this.getAccountData.bind(this)}
          validateAddToQueue={this.validateAddToQueue.bind(this)}
          {...this.props}
        />

        <MoveBetweenAccountsModal
          calculateUSDvalue={this.calculateUSDvalue.bind(this)}
          getAccountData={this.getAccountData.bind(this)}
          accountChanger={this.accountChanger.bind(this)}
          {...this.props}
        />

        {!this.props.isInSync || !this.props.connections ? (
          <WaitingText>
            <FormattedMessage
              id="TrustList.SyncMsg"
              defaultMessage="Please wait for the daemon to load"
            />
            ...
          </WaitingText>
        ) : (
          <div>
            <SendForm>
              <FormField connectLabel label="Send From">
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
              </FormField>
              <FormField label="Send To">
                <InputGroup>
                  <TextField
                    placeholder="Recipient Address"
                    value={this.props.Addressplaceholder}
                    onChange={e => this.props.updateAddress(e.target.value)}
                    required
                    style={{ flexGrow: 1 }}
                  />
                  <Button
                    fitHeight
                    className="relative"
                    onClick={() => {
                      this.props.clearSearch();
                      this.props.OpenModal4('Address Lookup');
                    }}
                  >
                    <Icon spaceRight icon={addressBookIcon} />
                    Lookup
                  </Button>
                </InputGroup>
              </FormField>
              <SendAmount>
                <SendAmountField>
                  <FormField
                    connectLabel
                    label={
                      <FormattedMessage
                        id="sendReceive.Amount"
                        defaultMessage="Nexus Amount"
                      />
                    }
                  >
                    <TextField
                      placeholder="0.00000"
                      value={this.props.Amount}
                      onChange={e => this.nxsAmount(e, true)}
                      required
                    />
                  </FormField>
                </SendAmountField>
                <SendAmountEqual>=</SendAmountEqual>
                <SendAmountField>
                  <FormField
                    connectLabel
                    label={this.props.settings.fiatCurrency}
                  >
                    <TextField
                      placeholder="0.00"
                      value={this.props.USDAmount}
                      onChange={e => {
                        this.nxsAmount(e);
                      }}
                      required
                    />
                  </FormField>
                </SendAmountField>
              </SendAmount>
              <FormattedMessage
                id="sendReceive.EnterYourMessage"
                defaultMessage="Enter Your Message"
              >
                {placeholder => (
                  <FormField
                    connectLabel
                    label={
                      <FormattedMessage
                        id="sendReceive.Message"
                        defaultMessage="Message"
                      />
                    }
                  >
                    <TextField
                      multiline
                      value={this.props.Message}
                      onChange={e => this.props.updateMessage(e.target.value)}
                      name="message"
                      rows={1}
                      placeholder={placeholder}
                    />
                  </FormField>
                )}
              </FormattedMessage>
              <SendFormButtons>
                {this.editQueue()}
                <Button
                  skin="primary"
                  onClick={() => {
                    console.log(this.props.encrypted, this.props.loggedIn);
                    if (!(this.props.Address === '') && this.props.Amount > 0) {
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
                  <Icon icon={sendIcon} spaceRight />
                  <FormattedMessage
                    id="sendReceive.SendNow"
                    defaultMessage="Send Now"
                  />
                </Button>
              </SendFormButtons>
            </SendForm>

            {this.props.Queue && !!Object.keys(this.props.Queue).length && (
              <Queue accHud={this.accHud.bind(this)} {...this.props} />
            )}
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
