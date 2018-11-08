import React, { Component } from "react";
import { Link } from "react-router-dom";
import styles from "./style.css";
import { connect } from "react-redux";
import * as RPC from "../../script/rpc";
import Modal from "react-responsive-modal";
import * as TYPE from "../../actions/actiontypes";
import { FormattedMessage } from "react-intl";
import ContextMenuBuilder from "../../contextmenu";
import { remote } from "electron";
import { access } from "fs";

// import images here
import sendimg from "../../images/send.svg";
import plusimg from "../../images/plus.svg";
import trashimg from "../../images/trash.svg";
import addressbookimg from "../../images/addressbook.svg";

const mapStateToProps = state => {
  return {
    ...state.common,
    ...state.transactions,
    ...state.sendRecieve,
    ...state.overview,
    ...state.addressbook,
    ...state.settings,
    ...state.intl
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
      payload: { USDAmount: USD, Amount: NxsVal }
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
  Confirm: Answer => {
    dispatch({ type: TYPE.CONFIRM, payload: Answer });
  }
});

class SendRecieve extends Component {
  componentDidMount() {
    RPC.PROMISE("listaccounts").then(payload => {
      this.props.changeAccount(
        Object.entries(payload).map(e => {
          return {
            name: e[0],
            val: e[1]
          };
        })
      );
    });
    window.addEventListener("contextmenu", this.setupcontextmenu, false);

    this.props.googleanalytics.SendScreen("Send");
  }

  loadMyAccounts() {
    RPC.PROMISE("listaccounts", [0]).then(payload => {
      Promise.all(
        Object.keys(payload).map(account =>
          RPC.PROMISE("getaddressesbyaccount", [account])
        )
      ).then(payload => {
        let validateAddressPromises = [];

        payload.map(element => {
          element.addresses.map(address => {
            validateAddressPromises.push(
              RPC.PROMISE("validateaddress", [address])
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
                if (ele.account == "" || ele.account == "default") {
                  return ele;
                }
              });

              if (e.account === "" || e.account === "default") {
                if (index === -1 && indexDefault === -1) {
                  accountsList.push({
                    account: "default",
                    addresses: [e.address]
                  });
                } else {
                  accountsList[indexDefault].addresses.push(e.address);
                }
              } else {
                if (index === -1) {
                  accountsList.push({
                    account: e.account,
                    addresses: [e.address]
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

  // React Method (Life cycle hook)

  componentWillUnmount() {
    window.removeEventListener("contextmenu", this.setupcontextmenu);
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
            this.props.OpenModal2("Edit Entry?");
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
        <button
          name="Add To Queue"
          className="button large"
          onClick={() => this.validateAddToQueue()}
        >
          <FormattedMessage
            id="sendReceive.AddToQueue"
            defaultMessage="Add To Queue"
          />
        </button>
      );
    }
  }

  nxsAmount(e, isNxs) {
    console.log(this.props.USD);
    if (/^[0-9.]+$/.test(e.target.value) | (e.target.value === "")) {
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
    if (this.props.SelectedAccount === "") {
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
    if (this.props)
      if (this.props.AccountChanger[0]) {
        return this.props.AccountChanger.map(e => {
          if (e.name === "") {
            return (
              <FormattedMessage
                id="sendReceive.MyAccount"
                defaultMessage="My Account"
                key={e.name}
                value={e.name}
              >
                {placeholder => (
                  <option>
                    {placeholder} : {e.val.toFixed(5)}
                    NXS
                  </option>
                )}
              </FormattedMessage>
            );
          } else {
            return (
              <option key={e.name} value={e.name}>
                {e.name}: {e.val}
                NXS
              </option>
            );
          }
        });
      } else {
        return null;
      }
  }

  sendOne() {
    this.props.busy();
    if (!(this.props.Address === "") && this.props.Amount > 0) {
      RPC.PROMISE("validateaddress", [this.props.Address])
        .then(payload => {
          if (payload.isvalid) {
            if (!payload.ismine) {
              if (this.props.Message) {
                RPC.PROMISE("sendtoaddress", [
                  this.props.Address,
                  parseFloat(this.props.Amount),
                  this.props.Message
                ]);
                this.props.clearForm();
                this.props.busy();
              } else {
                RPC.PROMISE("sendtoaddress", [
                  this.props.Address,
                  parseFloat(this.props.Amount)
                ]).then(payoad => console.log(payload));
                this.props.clearForm();
                this.props.busy();
              }
            } else {
              this.props.busy();
              this.props.OpenModal(
                "This is an address regiestered to this wallet"
              );
            }
          } else {
            this.props.busy();
            this.props.OpenModal("Invalid Address");
          }
        })
        .catch(e => {
          this.props.busy();
          this.props.OpenModal("Invalid Address");
        });
    } else {
      this.props.busy();
    }
  }

  sendMany() {
    this.props.busy();
    let keyCheck = Object.keys(this.props.Queue);
    if (keyCheck.length > 1) {
      console.log("tree");
      RPC.PROMISE("sendmany", [this.props.SelectedAccount, this.props.Queue])
        .then(payoad => {
          this.props.busy();
          this.props.clearForm();
          this.props.clearQueue();
        })
        .catch(e => {
          this.props.busy();
        });
    } else if (Object.values(this.props.Queue)[0] > 0) {
      console.log("pee");
      RPC.PROMISE("sendtoaddress", [
        keyCheck[0],
        Object.values(this.props.Queue)[0]
      ])
        .then(payoad => {
          this.props.busy();
          this.props.clearForm();
          this.props.clearQueue();
        })
        .catch(e => {
          this.props.busy();
          this.props.OpenModal("No Addresses");
        });
    }
  }

  areYouSure() {
    let values = Object.values(this.props.Queue);
    return values;
  }
  addAmount() {
    let keyCheck = Object.keys(this.props.Queue);
    if (keyCheck.length > 0) {
      let sum = Object.values(this.props.Queue).reduce((acc, val) => {
        return acc + val;
      });
      return (
        <div id="summary">
          <p>
            <FormattedMessage id="sendReceive.Total" defaultMessage="TOTAL" />:{" "}
            {""}
            {sum.toFixed(5)} NXS
          </p>

          <p>
            <FormattedMessage id="sendReceive.FEE" defaultMessage="FEE" />:{" "}
            {this.props.paytxfee.toFixed(5)} NXS
          </p>

          <p>
            <FormattedMessage id="sendReceive.From" defaultMessage="FROM" />:{" "}
            {this.accHud(this.props.SelectedAccount)}
          </p>
        </div>
      );
    }
  }
  validateAddToQueue() {
    if (!(this.props.Address === "") && this.props.Amount > 0) {
      console.log(this.props.Address);
      RPC.PROMISE("validateaddress", [this.props.Address])
        .then(payload => {
          console.log(payload);
          if (payload.isvalid) {
            if (!payload.ismine) {
              this.props.addToQueue({
                address: this.props.Address,
                amount: parseFloat(this.props.Amount)
              });
            } else {
              this.props.OpenModal(
                "This is an address regiestered to this wallet"
              );
            }
          } else {
            this.props.OpenModal("Invalid Address");
          }
        })
        .catch(e => {
          this.props.OpenModal("Invalid Address");
        });
    }
  }

  addressBookToQueue() {
    let filteredAddress = this.props.addressbook.filter(e => {
      return (
        e.name.toLowerCase().indexOf(this.props.Search.toLowerCase()) !== -1
      );
    });
    return filteredAddress.map((e, i) => {
      return (
        <tr>
          <td className="tdn" key={e.name + i}>
            {" "}
            {e.name}
          </td>
          {e.notMine.map((ele, i) => {
            return (
              <td
                onClick={() => {
                  this.props.updateAddress(ele.address);
                  this.props.OpenModal("Copied");
                  setTimeout(() => {
                    if (this.props.open) {
                      this.props.CloseModal();
                    }
                  }, 3000);
                }}
                className="dt"
                key={ele.address + i}
              >
                {ele.address}
                <span
                  key={ele.address + i}
                  className="tooltip right"
                  style={{ whiteSpace: "nowrap" }}
                >
                  {" "}
                  <FormattedMessage
                    id="sendReceive.CopyToFeild"
                    defaultMessage="Copy To Field"
                  />
                </span>
              </td>
            );
          })}
          {/* {e.notMine.map((ele, i) => {
            return (
              <td className="tdPop">
                <img
                  id="InnerPopulate"
                  src={plusimg}
                  onClick={() => this.props.updateAddress(ele.address)}
                />
                <span className="tooltip left">Click To Populate Field</span>
              </td>
            );
          })} */}
        </tr>
      );
    });
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
      // return `${helpers.ReturnCurrencySymbol(
      //   selectedCurrancyValue[0].name,
      //   this.props.displayNXSvalues
      // ) + currencyValue}`;
      return currencyValue;
    } else {
      return 0;
    }
  }

  // calculateUSDvalue(e) {
  //   let USDvalue = this.props.USDAmount * this.props.USD;

  //   if (USDvalue === 0) {
  //     USDvalue = USDvalue;
  //   } else {
  //     USDvalue = USDvalue;
  //   }
  //   return USDvalue;
  // }
  // calculateNexusVxalue(e) {
  //   let USDvalue = this.props.Amount * this.props.USD;

  //   if (USDvalue === 0) {
  //     USDvalue = USDvalue;
  //   } else {
  //     USDvalue = USDvalue;
  //   }
  //   return USDvalue;
  // }

  fillQueue() {
    let Keys = Object.keys(this.props.Queue);
    let values = Object.values(this.props.Queue);
    let queueArray = Keys.map((e, i) => {
      let newObj = {
        key: e,
        val: values[i]
      };
      console.log(newObj);
      return newObj;
    });

    console.log(Keys, values, queueArray);
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
            classNames={{ modal: "custom-modal2", overlay: "custom-overlay" }}
            showCloseIcon={false}
            open={this.props.openThirdModal}
            onClose={this.props.CloseModal3}
            center
          >
            <div>
              {" "}
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

  modalinternal3() {
    switch (this.props.LookUpModalType) {
      case "Address Lookup":
        return (
          <div className="Addresstable-wraper">
            {" "}
            <h2 className="addressModalHeader">
              <FormattedMessage
                id="sendReceive.Lookup"
                defaultMessage="Lookup Address"
              />{" "}
              <img src={addressbookimg} className="hdr-img" />
            </h2>
            <table id="AddressTable">
              <thead className="AddressThead">
                <th className="short-column">
                  <FormattedMessage
                    id="sendReceive.Name"
                    defaultMessage="Name"
                  />
                </th>
                <th className="long-column">
                  <FormattedMessage
                    id="sendReceive.Address"
                    defaultMessage="Address"
                  />
                </th>
                <th className="short-column">
                  <FormattedMessage
                    id="sendReceive.Lookup"
                    defaultMessage="Search Address"
                  >
                    {placeholder => (
                      <input
                        className="searchBar"
                        type="text"
                        placeholder={placeholder}
                        value={this.props.Search}
                        onChange={e => this.props.SearchName(e.target.value)}
                        required
                      />
                    )}
                  </FormattedMessage>
                </th>
              </thead>
              {this.addressBookToQueue()}
            </table>
          </div>
        );
    }
  }

  MyAddressesTable() {
    let filteredAddress = this.props.myAccounts.filter(acct => {
      if (acct.account === "default") {
        let dummie = "My Account";
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
                {acct.account === "default" ? (
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
      case "send transaction?":
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
      case "Clear Queue?":
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
      case "Send Multiple?":
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
      case "Edit Entry?":
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
      // case "Delete Entry?":
      //   return (
      //     <div>
      //       <h2>
      //         <FormattedMessage
      //           id="sendReceive.DeleteEntry"
      //           defaultMessage="Delete Entry?"
      //         />
      //       </h2>
      //       <div id="ok-button">
      //         <FormattedMessage id="sendReceive.Yes">
      //           {yes => (
      //             <input
      //               value={yes}
      //               type="button"
      //               className="button primary"
      //               onClick={() => {
      //                 this.props.CloseModal2();
      //               }}
      //             />
      //           )}
      //         </FormattedMessage>
      //       </div>
      //     </div>
      //   );
      //   break;
      // case "Address Lookup":
      //   return (
      //     <div className="Addresstable-wraper">
      //       {" "}
      //       <h2 className="addressModalHeader">
      //         <FormattedMessage
      //           id="sendReceive.Lookup"
      //           defaultMessage="Lookup Address"
      //         />{" "}
      //         <img src={addressbookimg} className="hdr-img" />
      //       </h2>
      //       <table id="AddressTable">
      //         <thead className="AddressThead">
      //           <th className="short-column">Name</th>
      //           <th className="long-column">Address</th>
      //           <th className="short-column">
      //             <input
      //               className="searchBar"
      //               type="text"
      //               placeholder="Search Address"
      //               value={this.props.Search}
      //               onChange={e => this.props.SearchName(e.target.value)}
      //               required
      //             />
      //           </th>
      //         </thead>
      //         {this.addressBookToQueue()}
      //       </table>
      //     </div>
      //   );
      //   break;

      default:
        "Error";
        break;
    }
  }

  render() {
    ///THIS IS NOT THE RIGHT AREA, this is for auto completing when you press a transaction
    if (this.props.sendagain != undefined && this.props.sendagain != null) {
      console.log(this.props.sendagain);

      this.props.SetSendAgainData(null);
    }
    return (
      <div id="sendrecieve" className="animated fadeIn">
        <h2>
          <img src={sendimg} className="hdr-img" />
          <FormattedMessage
            id="sendReceive.SendNexus"
            defaultMessage="Send Nexus"
          />
        </h2>
        {/* ADDRESS MODAL */}
        <Modal
          center
          classNames={{ modal: "custom-modal3" }}
          showCloseIcon={true}
          open={this.props.openFourthModal}
          onClose={this.props.CloseModal4}
        >
          {this.modalinternal3()}
        </Modal>

        {/* CONFIRMATION MODAL */}
        <Modal
          center
          classNames={{ modal: "custom-modal2", overlay: "custom-overlay" }}
          showCloseIcon={false}
          open={this.props.openSecondModal}
          onClose={this.props.CloseModal2}
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
        {this.props.isInSync === false ||
        this.props.connections === undefined ? (
          <div className="panel">
            <h2>
              <FormattedMessage
                id="TrustList.SyncMsg"
                defaultMessage="Please wait for the daemon to load"
              />
            </h2>
          </div>
        ) : (
          <div className="panel">
            <div id="container">
              <div className="box1">
                <div className="field">
                  <select
                    id="select"
                    onChange={e => this.props.AccountPicked(e.target.value)}
                  >
                    {this.accountChanger()}
                  </select>{" "}
                  <p>
                    <label>
                      <FormattedMessage
                        id="sendReceive.Address"
                        defaultMessage="Nexus Address"
                      />
                    </label>{" "}
                    <FormattedMessage
                      id="sendReceive.Lookup"
                      defaultMessage="Lookup Address"
                    >
                      {Al => (
                        <div className="Addresslookup" title={Al}>
                          {/* <span className="tooltip top" /> */}
                          <img
                            src={plusimg}
                            className="lookupButton"
                            onClick={() => {
                              this.props.clearSearch();
                              this.props.OpenModal4("Address Lookup");
                            }}
                          />
                        </div>
                      )}
                    </FormattedMessage>
                    <FormattedMessage
                      id="sendReceive.Address"
                      defaultMessage="Nexus Address"
                    >
                      {placeholder => (
                        <input
                          size="35"
                          type="text"
                          placeholder={placeholder}
                          value={this.props.Address}
                          onChange={e =>
                            this.props.updateAddress(e.target.value)
                          }
                          required
                        />
                      )}
                    </FormattedMessage>
                  </p>
                  <p>
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
                      <input
                        className="input"
                        type="text"
                        placeholder="0.00000"
                        value={this.props.Amount}
                        onChange={e => this.nxsAmount(e, true)}
                        required
                      />{" "}
                      <label>=</label>
                      <input
                        className="input"
                        type="text"
                        placeholder="0.00"
                        value={this.props.USDAmount}
                        onChange={e => {
                          this.nxsAmount(e);
                        }}
                        required
                      />
                    </div>
                  </p>
                  <p>
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
                        <textarea
                          value={this.props.Message}
                          onChange={e =>
                            this.props.updateMessage(e.target.value)
                          }
                          name="message"
                          rows="5"
                          cols="41"
                          placeholder={placeholder}
                        />
                      )}
                    </FormattedMessage>
                  </p>
                  <div id="left-buttons">
                    {this.editQueue()}
                    <button
                      className="button"
                      onClick={() => {
                        if (
                          !(this.props.Address === "") &&
                          this.props.Amount > 0
                        ) {
                          if (
                            this.props.encrypted === false ||
                            this.props.loggedIn === true
                          ) {
                            this.props.OpenModal2("send transaction?");
                          } else {
                            this.props.OpenModal("Wallet Locked");
                          }
                        } else {
                          this.props.OpenModal("Invalid Address");
                        }
                      }}
                    >
                      <FormattedMessage
                        id="sendReceive.SendNow"
                        defaultMessage="Send Now"
                      />
                    </button>
                  </div>
                </div>
              </div>

              <div className="box2">
                <div id="table-wraper">
                  <p className="label">
                    <label>
                      <FormattedMessage
                        id="sendReceive.Queue"
                        defaultMessage="Queue"
                      />
                    </label>
                  </p>
                  <table className="table">
                    <thead className="thead">
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
                      <th style={{ whiteSpace: "nowrap" }}>
                        <FormattedMessage
                          id="sendReceive.Remove"
                          defaultMessage="Remove"
                        />
                      </th>
                    </thead>
                    {this.fillQueue()}
                  </table>
                  <foot className="foot">
                    <button
                      type="reset"
                      className="button primary"
                      onClick={() => {
                        if (
                          this.props.encrypted === false ||
                          this.props.loggedIn === false
                        ) {
                          if (Object.keys(this.props.Queue).length > 0) {
                            this.props.OpenModal2("Send Multiple?");
                          } else {
                            this.props.OpenModal("Empty Queue!");
                          }
                        } else {
                          this.props.OpenModal("Wallet Locked");
                        }
                      }}
                    >
                      <FormattedMessage
                        id="sendReceive.SendAll"
                        defaultMessage="SendAll"
                      />
                    </button>

                    <button
                      type="button"
                      className="button primary"
                      onClick={() => {
                        this.props.OpenModal2("Clear Queue?");
                      }}
                    >
                      <FormattedMessage
                        id="sendReceive.ClearQueue"
                        defaultMessage="Clear Queue"
                      />
                    </button>

                    <p>
                      <div className="counter">{this.addAmount()} </div>
                    </p>
                  </foot>{" "}
                </div>{" "}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SendRecieve);
