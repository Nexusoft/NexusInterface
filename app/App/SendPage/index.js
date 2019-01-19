// External Dependencies
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { remote } from 'electron';
import styled from '@emotion/styled';

// Internal Global Dependencies
import googleanalytics from 'scripts/googleanalytics';
import * as RPC from 'scripts/rpc';
import * as TYPE from 'actions/actiontypes';
import ContextMenuBuilder from 'contextmenu';
import Text from 'components/Text';
import Icon from 'components/Icon';
import Panel from 'components/Panel';
import Button from 'components/Button';
import TextField from 'components/TextField';
import Select from 'components/Select';
import WaitingMessage from 'components/WaitingMessage';
import FormField from 'components/FormField';
import InputGroup from 'components/InputGroup';
import Tooltip from 'components/Tooltip';
import UIController from 'components/UIController';
import Link from 'components/Link';

// Internal Local Dependencies
import LookupAddressModal from './LookupAddressModal';
import MoveBetweenAccountsModal from './MoveBetweenAccountsModal';
import Queue from './Queue';
import styles from './style.css';

// Resources
import sendIcon from 'images/send.sprite.svg';
import swapIcon from 'images/swap.sprite.svg';
import addressBookIcon from 'images/address-book.sprite.svg';

const SendForm = styled.div({
  maxWidth: 620,
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
    // accountOptions: state.sendReceive.AccountChanger
    //   ? state.sendReceive.AccountChanger.map(e => ({
    //       value: e.name,
    //       display: `${e.name} (${e.val} NXS)`,
    //     }))
    //   : [],
    ...state.common,
    ...state.transactions,
    ...state.sendReceive,
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
  // OpenErrorModal: type => {
  //   dispatch({ type: TYPE.SHOW_ERROR_MODAL, payload: type });
  // },
  // CloseErrorModal: type => {
  //   dispatch({ type: TYPE.HIDE_ERROR_MODAL, payload: type });
  // },
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

class SendPage extends Component {
  componentDidMount() {
    window.addEventListener('contextmenu', this.setupcontextmenu, false);
    this.getAccountData();
    googleanalytics.SendScreen('Send');
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.connections === undefined &&
      this.props.connections !== undefined
    ) {
      this.getAccountData();
    }
  }

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

  getAccountData = async () => {
    const payload = await RPC.PROMISE('listaccounts');
    const accounts = Object.entries(payload).map(e => ({
      name: e[0],
      val: e[1],
    }));
    this.props.changeAccount(accounts);
  };

  editQueue() {
    if (Object.keys(this.props.Queue).includes(this.props.Address)) {
      return (
        <Button
          onClick={() => {
            this.props.OpenModal2('Edit Entry?');
          }}
        >
          <Text id="sendReceive.EditQueue" />
        </Button>
      );
    } else {
      return (
        <Button onClick={() => this.validateAddToQueue()}>
          <Text id="sendReceive.AddToQueue" />
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
      return <Text id="sendReceive.MyAccount" />;
    } else {
      return this.props.SelectedAccount;
    }
  }

  accountOptions() {
    if (this.props.AccountChanger) {
      return [
        {
          value: '',
          display: <Text id="sendReceive.SelectAnAccount" />,
        },
        ...this.props.AccountChanger.map(e => ({
          value: e.name,
          display: `${e.name} (${e.val} NXS)`,
        })),
      ];
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
              UIController.openErrorDialog({
                message: <Text id="Alert.registeredToThis" />,
              });
            }
          } else {
            UIController.openErrorDialog({
              message: <Text id="Alert.InvalidAddress" />,
            });
          }
        })
        .catch(e => {
          UIController.openErrorDialog({
            message: <Text id="Alert.InvalidAddress" />,
          });
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

  moveBetweenAccounts = () => {
    UIController.openModal(MoveBetweenAccountsModal, {
      calculateUSDvalue: this.calculateUSDvalue.bind(this),
      getAccountData: this.getAccountData.bind(this),
      accountOptions: this.accountOptions(),
      ...this.props,
    });
  };

  lookupAddress = () => {
    UIController.openModal(LookupAddressModal);
  };

  sendOne = () => {
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
                      UIController.showNotification(
                        <Text id="Alert.Sent" />,
                        'success'
                      );
                      this.props.clearForm();
                      this.props.busy();
                    })
                    .catch(e => {
                      console.log(e);
                      this.props.busy();
                      UIController.openErrorDialog({ message: e });
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
                      UIController.showNotification(
                        <Text id="Alert.Sent" />,
                        'success'
                      );
                      this.props.clearForm();
                      this.props.busy();
                    })
                    .catch(e => {
                      console.log(e);
                      this.props.busy();
                      UIController.openErrorDialog({ message: e });
                    });
                }
              } else {
                this.props.busy();
                UIController.openErrorDialog({
                  message: <Text id="Alert.registeredToThis" />,
                });
              }
            } else {
              this.props.busy();
              UIController.openErrorDialog({
                message: <Text id="Alert.InvalidAddress" />,
              });
            }
          })
          .catch(e => {
            this.props.busy();
            UIController.openErrorDialog({
              message: <Text id="Alert.InvalidAddress" />,
            });
          });
      } else {
        this.props.busy();
      }
    } else {
      UIController.openErrorDialog({ message: 'No Account Selected' });
    }
  };

  confirmSendNow = () => {
    const { Address, Amount, encrypted, loggedIn } = this.props;

    if (!Address) {
      UIController.openErrorDialog({
        message: <Text id="Alert.InvalidAddress" />,
      });
      return;
    }
    if (Amount <= 0) {
      UIController.openErrorDialog({
        message: <Text id="Alert.InvalidAmount" />,
      });
      return;
    }
    if (encrypted && !loggedIn) {
      this.walletLockedErrorId = UIController.openErrorDialog({
        message: 'Wallet is being locked',
        note: (
          <Link
            to="/Settings/Security"
            onClick={() => {
              UIController.removeModal(this.walletLockedErrorId);
            }}
          >
            Unlock your wallet
          </Link>
        ),
      });
      return;
    }

    UIController.openConfirmDialog({
      question: <Text id="sendReceive.SendTransaction" />,
      yesCallback: this.sendOne,
    });
  };

  render() {
    ///THIS IS NOT THE RIGHT AREA, this is for auto completing when you press a transaction
    if (this.props.sendagain != undefined && this.props.sendagain != null) {
      this.props.SetSendAgainData(null);
    }

    return (
      <Panel
        icon={sendIcon}
        title={<Text id="sendReceive.SendNexus" />}
        controls={
          this.props.connections !== undefined && (
            <Tooltip.Trigger
              tooltip={<Text id="sendReceive.MoveNxsBetweenAccount" />}
            >
              <Button
                square
                skin="primary"
                className="relative"
                onClick={this.moveBetweenAccounts}
              >
                <Icon icon={swapIcon} />
              </Button>
            </Tooltip.Trigger>
          )
        }
      >
        {!this.props.isInSync || this.props.connections === undefined ? (
          <WaitingMessage>
            <Text id="TrustList.SyncMsg" />
            ...
          </WaitingMessage>
        ) : (
          <div>
            <SendForm>
              <FormField label="Send From">
                <Select
                  value={this.props.SelectedAccount}
                  onChange={this.props.AccountPicked}
                  options={this.accountOptions()}
                />
              </FormField>
              <FormField label="Send To">
                <InputGroup>
                  <TextField
                    placeholder="Recipient Address"
                    value={this.props.Address}
                    onChange={e => this.props.updateAddress(e.target.value)}
                    required
                    style={{ flexGrow: 1 }}
                  />
                  <Button
                    fitHeight
                    className="relative"
                    onClick={this.lookupAddress}
                  >
                    <Icon spaceRight icon={addressBookIcon} />
                    <Text id="sendReceive.Contacts" />
                  </Button>
                </InputGroup>
              </FormField>
              <SendAmount>
                <SendAmountField>
                  <FormField
                    connectLabel
                    label={<Text id="sendReceive.Amount" />}
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
              <Text id="sendReceive.EnterYourMessage">
                {placeholder => (
                  <FormField
                    connectLabel
                    label={<Text id="sendReceive.Message" />}
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
              </Text>
              <SendFormButtons>
                {this.editQueue()}
                <Button skin="primary" onClick={this.confirmSendNow}>
                  <Icon icon={sendIcon} spaceRight />
                  <Text id="sendReceive.SendNow" />
                </Button>
              </SendFormButtons>
            </SendForm>

            {this.props.Queue && !!Object.keys(this.props.Queue).length && (
              <Queue
                accHud={this.accHud.bind(this)}
                getAccountData={this.getAccountData}
                {...this.props}
              />
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
)(SendPage);
