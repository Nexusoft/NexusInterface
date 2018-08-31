import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { remote } from "electron";
import { Link } from "react-router-dom";
import Modal from "react-responsive-modal";

import config from "../../api/configuration";
import * as RPC from "../../script/rpc";
import * as TYPE from "../../actions/actiontypes";
import * as actionsCreators from "../../actions/addressbookActionCreators";
import TimeZoneSelector from "./timeZoneSelector";

import ContactView from "./ContactView";
import ContextMenuBuilder from "../../contextmenu";
import styles from "./style.css";
import profilePlaceholder from "images/Profile_Placeholder.png";
import { callbackify } from "util";

const mapStateToProps = state => {
  return { ...state.common, ...state.addressbook };
};

const mapDispatchToProps = dispatch =>
  bindActionCreators(actionsCreators, dispatch);

class Addressbook extends Component {
  componentDidMount() {
    this.loadMyAccounts();
    this.addressbookContextMenu = this.addressbookContextMenu.bind(this);
    window.addEventListener("contextmenu", this.addressbookContextMenu, false);
    this.props.googleanalytics.SendScreen("AddressBook");
  }

  componentWillUnmount() {
    window.removeEventListener("contextmenu", this.addressbookContextMenu);
  }

  addressbookContextMenu() {
    const txtTemplate = [
      {
        label: "Copy",
        ccelerator: "CmdOrCtrl+C",
        role: "copy"
      },
      {
        label: "Paste",
        ccelerator: "CmdOrCtrl+V",
        role: "paste"
      }
    ];

    const acctTemplate = [
      {
        label: "Copy",
        ccelerator: "CmdOrCtrl+C",
        role: "copy"
      },
      {
        label: "Paste",
        ccelerator: "CmdOrCtrl+V",
        role: "paste"
      },
      {
        label: "Delete Contact",
        click(item, focusedWindow) {
          deleteAccountCallback();
        }
      }
    ];

    let deleteAccountCallback = () => {
      if (
        confirm(
          `Are you sure you want to delete ${
            this.props.addressbook[this.props.actionItem].name
          }?`
        )
      ) {
        this.props.DeleteContact(this.props.actionItem);
      }
    };

    const addTemplate = [
      {
        label: "Copy",
        ccelerator: "CmdOrCtrl+C",
        role: "copy"
      },
      {
        label: "Paste",
        ccelerator: "CmdOrCtrl+V",
        role: "paste"
      },
      {
        label: "Delete Address",
        click(item, focusedWindow) {
          deleteAddressCallback();
        }
      }
    ];
    let deleteAddressCallback = () => {
      if (
        confirm(
          `Are you sure you want to delete this address? ${
            this.props.addressbook[this.props.selected][
              this.props.actionItem.type
            ][this.props.actionItem.index].address
          }`
        )
      ) {
        this.props.DeleteAddress(this.props.actionItem, this.props.selected);
      }
    };
    let addresscontextmenu = new remote.Menu();
    const contextmenu = new ContextMenuBuilder().defaultContext;
    let defaultcontextmenu = remote.Menu.buildFromTemplate(contextmenu);
    let acctMenu = remote.Menu.buildFromTemplate(acctTemplate);
    let txtMenu = remote.Menu.buildFromTemplate(txtTemplate);
    let addMenu = remote.Menu.buildFromTemplate(addTemplate);

    switch (this.props.hoveredOver) {
      case "account":
        acctMenu.popup(remote.getCurrentWindow());
        break;
      case "address":
        addMenu.popup(remote.getCurrentWindow());
        break;
      case "text":
        txtMenu.popup(remote.getCurrentWindow());
        break;
      default:
        defaultcontextmenu.popup(remote.getCurrentWindow());
        break;
    }
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

              if (index === -1) {
                accountsList.push({
                  account: e.account,
                  addresses: [e.address]
                });
              } else {
                accountsList[index].addresses.push(e.address);
              }
            }
          });
          this.props.MyAccountsList(accountsList);
        });
      });
    });
  }

  componentDidUpdate(previousprops) {
    if (this.props.save) {
      console.log("SAVE");
      config.WriteJson("addressbook.json", {
        addressbook: this.props.addressbook
      });
      this.props.ToggleSaveFlag();
    }
  }

  getinitial(name) {
    if (name && name.length >= 1) return name.charAt(0);
    return "M";
  }

  copyaddress(event) {
    event.preventDefault();
    let target = event.currentTarget;
    let address = event.target.innerText;

    // create a temporary input element and add it to the list item (no one will see it)
    let input = document.createElement("input");
    input.type = "text";
    target.appendChild(input);

    // set the value of the input to the selected address, then focus and select it
    input.value = address;
    input.focus();
    input.select();

    // copy it to clipboard
    document.execCommand("Copy", false, null);

    // remove the temporary element from the DOM
    input.remove();

    alert("copyed");
  }

  modalInternalBuilder() {
    let index = this.props.addressbook.findIndex(ele => {
      if (ele.name === this.props.prototypeName) {
        return ele;
      }
    });

    switch (this.props.modalType) {
      case "ADD_CONTACT":
        return (
          <div id="modalInternal">
            {index === -1 ? <h2>Add Contact</h2> : <h2>Edit Contact</h2>}

            <div className="field">
              <label htmlFor="new-account-name">Name</label>
              <input
                ref="addContactName"
                id="new-account-name"
                type="text"
                value={this.props.prototypeName}
                onChange={e => this.props.EditProtoName(e.target.value)}
                placeholder="Name"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="new-account-name">Phone #</label>
              <input
                id="new-account-phone"
                type="tel"
                onChange={e => this.phoneNumberHandler(e.target.value)}
                value={this.props.prototypePhoneNumber}
                placeholder="Phone #"
              />
            </div>
            <div className="contact-detail">
              <label>Local Time</label>
              <TimeZoneSelector />
            </div>

            <div className="field">
              <label htmlFor="new-account-notes">Notes</label>
              <textarea
                id="new-account-notes"
                onChange={e => this.props.EditProtoNotes(e.target.value)}
                value={this.props.prototypeNotes}
                rows="3"
              />
            </div>

            <div className="field">
              <label htmlFor="nxsaddress">Nexus Address</label>
              <input
                ref="addContactAddress"
                id="nxsaddress"
                type="text"
                onChange={e => this.props.EditProtoAddress(e.target.value)}
                value={this.props.prototypeAddress}
                placeholder="Nexus Address"
              />
            </div>

            <button
              className="button primary"
              onClick={() =>
                this.props.AddContact(
                  this.props.prototypeName,
                  this.props.prototypeAddress,
                  this.props.prototypePhoneNumber,
                  this.props.prototypeNotes,
                  this.props.prototypeTimezone
                )
              }
            >
              {index === -1 ? "Add Contact" : "Edit Contact"}
            </button>
            <button
              className="button"
              onClick={() => this.props.ToggleCreateModal()}
            >
              Cancel
            </button>
          </div>
        );
        break;
      case "MY_ADDRESSES":
        return (
          <div>
            {this.props.myAccounts.map((acct, i) => {
              return (
                <div key={acct + i}>
                  <div>{acct.account === "" ? "My Account" : acct.account}</div>
                  {acct.addresses.map(address => {
                    return (
                      <span>
                        <div
                          key={address}
                          onClick={event => this.copyaddress(event)}
                          className="myAddress"
                        >
                          {address}
                        </div>{" "}
                        <span key={address + i} className="tooltip">
                          Click to copy
                        </span>{" "}
                      </span>
                    );
                  })}
                </div>
              );
            })}
            <button
              className="button primary"
              onClick={() => this.props.SetModalType("NEW_MY_ADDRESS")}
            >
              Cerate new address
            </button>
          </div>
        );
        break;
      case "ADD_ADDRESS":
        return (
          <div>
            <h3>
              Add an address to{" "}
              {this.props.addressbook[this.props.selected].name}
            </h3>
            <div className="field">
              <label htmlFor="nxsaddress">Nexus Address</label>
              <input
                ref="addContactAddress"
                id="nxsaddress"
                type="text"
                onChange={e => this.props.EditProtoAddress(e.target.value)}
                value={this.props.prototypeAddress}
                placeholder="Nexus Address"
              />
            </div>

            <button
              className="button primary"
              onClick={() => {
                this.props.AddAddress(
                  this.props.addressbook[this.props.selected].name,
                  this.props.prototypeAddress,
                  this.props.selected
                );
              }}
            >
              Add Address
            </button>
            <button className="button" onClick={() => this.props.ToggleModal()}>
              Cancel
            </button>
          </div>
        );
        break;
      case "NEW_MY_ADDRESS":
        return (
          <div>
            <div className="field">
              <label htmlFor="new-account-name">Name (Optional)</label>
              <input
                ref="addContactName"
                id="new-account-name"
                type="text"
                value={this.props.prototypeName}
                onChange={e => this.props.EditProtoName(e.target.value)}
                placeholder="Name"
                required
              />
            </div>
            <button
              className="button primary"
              onClick={() => this.createAddress()}
            >
              Create
            </button>
          </div>
        );
        break;
      default:
        break;
    }
  }

  createAddress() {
    if (this.props.prototypeName) {
      RPC.PROMISE("getnewaddress", [this.props.prototypeName])
        .then(success => {
          this.props.ToggleModal();
          this.loadMyAccounts();
        })
        .catch(e => {
          alert(e);
        });
    } else {
      RPC.PROMISE("getnewaddress", [""])
        .then(success => {
          this.props.ToggleModal();
          this.loadMyAccounts();
        })
        .catch(e => {
          alert(e);
        });
    }
  }

  contactLister() {
    if (this.props.addressbook[0]) {
      return (
        <div
          id="contactList"
          onMouseOverCapture={() => this.props.SetMousePosition("", "")}
        >
          {this.props.addressbook.map((contact, i) => {
            let addTotal = contact.mine.length + contact.notMine.length;
            return (
              <div
                key={i}
                id={i}
                onClick={() => this.props.SelectedContact(i)}
                onMouseOverCapture={e => {
                  this.props.SetMousePosition("account", i);
                }}
                className="contact"
              >
                <span className="contact-avatar">
                  <svg viewBox="0 0 100 100">
                    <text x="50" y="50" dy=".35em">
                      {this.getinitial(contact.name)}
                    </text>
                  </svg>
                </span>
                <span className="contact-name">{contact.name}</span>
                <span className="contactAddresses">
                  {addTotal} {addTotal > 1 ? " addresses" : " address"}
                </span>
              </div>
            );
          })}
        </div>
      );
    }
  }

  phoneFormatter() {
    let num = this.props.addressbook[this.props.selected].phoneNumber;
    if (num.length === 12) {
      return `+ ${num.substring(0, 2)} ${num.substring(2, 4)} ${num.substring(
        4,
        8
      )} ${num.substring(8, 12)}`;
    } else if (num.length === 10) {
      return `(${num.substring(0, 3)}) ${num.substring(3, 6)}-${num.substring(
        6,
        10
      )}`;
    } else return num;
  }

  localTimeFormater() {
    let d = new Date();
    let utc = new Date().getTimezoneOffset();
    d.setMinutes(d.getMinutes() + utc);
    d.setMinutes(
      d.getMinutes() + this.props.addressbook[this.props.selected].timezone
    );

    let h = d.getHours();
    let m = d.getMinutes();
    let i = "AM";
    if (h >= 12) {
      i = "PM";
      h = h - 12;
    }
    if (h === 0) {
      h = "12";
    }
    if (m <= 9) {
      m = `0${m}`;
    }

    return (
      <div>
        <span
          onDoubleClick={() => {
            if (this.props.editTZ) {
              this.props.SaveTz(
                this.props.selected,
                this.props.prototypeTimezone
              );
            } else {
              this.props.TzToggler(
                this.props.addressbook[this.props.selected].timezone
              );
            }
          }}
        >
          {" "}
          Local Time:
        </span>{" "}
        {this.props.editTZ === true ? (
          <TimeZoneSelector />
        ) : (
          <span
            onDoubleClick={() =>
              this.props.TzToggler(
                this.props.addressbook[this.props.selected].timezone
              )
            }
          >
            {h}:{m} {i}
          </span>
        )}
      </div>
    );
  }

  theirAddressLister() {
    return (
      <div>
        <h3>Their addresses</h3>
        <div>
          {this.props.addressbook[this.props.selected].notMine.map((add, i) => {
            return (
              <div
                onContextMenu={e => {
                  this.props.SetMousePosition("address", {
                    index: i,
                    type: "notMine"
                  });
                }}
                key={i + add.address}
              >
                {this.props.editAddressLabel === add.address ? (
                  <input
                    onChange={e => this.props.EditProtoLabel(e.target.value)}
                    value={this.props.prototypeAddressLabel}
                    onDoubleClick={() =>
                      this.props.SaveLabel(
                        this.props.selected,
                        add.address,
                        this.props.prototypeAddressLabel,
                        false
                      )
                    }
                  />
                ) : (
                  <span
                    onDoubleClick={() =>
                      this.props.LabelToggler(add.label, add.address)
                    }
                  >
                    {add.label === "'s Address"
                      ? `${this.props.addressbook[this.props.selected].name}${
                          add.label
                        }`
                      : add.label}
                    :
                  </span>
                )}
                <div onClick={event => this.copyaddress(event)}>
                  {add.address}
                </div>
                <span className="tooltip">Click to copy</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  myAddressLister() {
    return (
      <div id="myAddresses">
        <h3>My addresses</h3>
        <div>
          {this.props.addressbook[this.props.selected].mine.map((add, i) => {
            return (
              <div
                onContextMenu={e => {
                  this.props.SetMousePosition("address", {
                    index: i,
                    type: "mine"
                  });
                }}
                key={i + add.address}
              >
                {this.props.editAddressLabel === add.address ? (
                  <input
                    onChange={e => this.props.EditProtoLabel(e.target.value)}
                    value={this.props.prototypeAddressLabel}
                    onDoubleClick={() =>
                      this.props.SaveLabel(
                        this.props.selected,
                        add.address,
                        this.props.prototypeAddressLabel,
                        true
                      )
                    }
                  />
                ) : (
                  <span
                    onDoubleClick={() =>
                      this.props.LabelToggler(add.label, add.address)
                    }
                  >
                    {add.label === "My Address for "
                      ? `${add.label}${
                          this.props.addressbook[this.props.selected].name
                        }`
                      : add.label}
                    :
                  </span>
                )}
                <div onClick={event => this.copyaddress(event)}>
                  {add.address}{" "}
                </div>
              </div>
            );
          })}{" "}
          <span className="tooltip">Click to copy</span>
        </div>
      </div>
    );
  }

  addAddressHandler() {
    this.props.SetModalType("ADD_ADDRESS");
    this.props.ToggleModal();
  }

  showAddContactModal() {
    this.props.SetModalType("ADD_CONTACT");
    this.props.ToggleModal();
  }

  showMyAddresses() {
    this.props.SetModalType("MY_ADDRESSES");
    this.props.ToggleModal();
  }

  phoneNumberHandler(value) {
    if (/^[0-9.]+$/.test(value) | (value === "")) {
      this.props.EditProtoPhone(value);
    } else {
      return null;
    }
  }

  render() {
    return (
      <div id="addressbook">
        <Modal
          open={this.props.modalVisable}
          center
          onClose={this.props.ToggleModal}
          classNames={{ modal: "modal" }}
        >
          {this.modalInternalBuilder()}
        </Modal>
        <h2>Address Book</h2>
        <a className="refresh" onClick={() => this.exportAddressBook()}>
          Export Contacts
        </a>
        <div className="panel">
          <div id="addressbook-controls">
            <div id="addressbook-search">
              {/* {this.props.addressbook.length > 0 && (
                <div>
                  <input type="text" />
                  <button id="searchContacts" />
                </div>
              )} */}
            </div>

            <button
              className="button ghost"
              onClick={() => this.showMyAddresses()}
            >
              My Addresses
            </button>
            <button
              className="button primary"
              onClick={() => this.showAddContactModal()}
            >
              Add Contact
            </button>
          </div>
          {this.props.addressbook.length > 0 ? (
            <div id="addressbookContent">
              <div id="contactListContainer">{this.contactLister()}</div>
              {this.props.addressbook[this.props.selected].mine && (
                <div id="contactDetailContainer">
                  <fieldset id="contactDetails">
                    <legend>
                      {this.props.editName === true ? (
                        <input
                          ref="addContactName"
                          id="new-account-name"
                          type="text"
                          value={this.props.prototypeName}
                          onChange={e =>
                            this.props.EditProtoName(e.target.value)
                          }
                          placeholder="Name"
                          onDoubleClick={() =>
                            this.props.SaveName(
                              this.props.selected,
                              this.props.prototypeName
                            )
                          }
                        />
                      ) : (
                        <span
                          onDoubleClick={() =>
                            this.props.NameToggler(
                              this.props.addressbook[this.props.selected].name
                            )
                          }
                        >
                          {this.props.addressbook[this.props.selected].name}
                        </span>
                      )}{" "}
                      <div className="tooltip">Doubleclick to edit</div>
                    </legend>
                    <div id="contactInformation">
                      <div>
                        <div>
                          {" "}
                          <label
                            onDoubleClick={() =>
                              this.props.PhoneToggler(
                                this.props.addressbook[this.props.selected]
                                  .phoneNumber
                              )
                            }
                            htmlFor="phoneNumber"
                          >
                            Phone number:
                          </label>
                          {this.props.editPhone === true ? (
                            <input
                              id="phoneNumber"
                              name="phoneNumber"
                              type="tel"
                              onChange={e =>
                                this.phoneNumberHandler(e.target.value)
                              }
                              value={this.props.prototypePhoneNumber}
                              placeholder="Phone #"
                              onDoubleClick={() =>
                                this.props.SavePhone(
                                  this.props.selected,
                                  this.props.prototypePhoneNumber
                                )
                              }
                            />
                          ) : (
                            <span
                              onDoubleClick={() =>
                                this.props.PhoneToggler(
                                  this.props.addressbook[this.props.selected]
                                    .phoneNumber
                                )
                              }
                              id="phoneNumber"
                            >
                              {" "}
                              {this.phoneFormatter()}
                            </span>
                          )}
                          <span className="tooltip">Doubleclick to edit</span>
                        </div>
                        {this.localTimeFormater()}
                        <div id="notesContainer">
                          <label
                            onDoubleClick={() =>
                              this.props.NotesToggler(
                                this.props.addressbook[this.props.selected]
                                  .notes
                              )
                            }
                            htmlFor="notes"
                          >
                            Notes:
                          </label>
                          {this.props.editNotes === true ? (
                            <div>
                              <textarea
                                id="notes"
                                name="notes"
                                onDoubleClick={() =>
                                  this.props.SaveNotes(
                                    this.props.selected,
                                    this.props.prototypeNotes
                                  )
                                }
                                onChange={e =>
                                  this.props.EditProtoNotes(e.target.value)
                                }
                                value={this.props.prototypeNotes}
                                rows="3"
                              />
                            </div>
                          ) : (
                            <div
                              id="notes"
                              name="notes"
                              onDoubleClick={() =>
                                this.props.NotesToggler(
                                  this.props.addressbook[this.props.selected]
                                    .notes
                                )
                              }
                            >
                              {
                                this.props.addressbook[this.props.selected]
                                  .notes
                              }
                            </div>
                          )}
                          <span className="tooltip">Doubleclick to edit</span>
                        </div>
                      </div>
                      {this.props.addressbook[this.props.selected].imgSrc !==
                      undefined ? (
                        <label htmlFor="picUploader">
                          <img
                            src={
                              this.props.addressbook[this.props.selected].imgSrc
                            }
                          />
                        </label>
                      ) : (
                        <label htmlFor="picUploader">
                          <img src={profilePlaceholder} />
                        </label>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        name="picUploader"
                        onChange={e =>
                          this.props.ChangeContactImage(
                            e.target.files[0].path,
                            this.props.selected
                          )
                        }
                        id="picUploader"
                      />{" "}
                      {/* <span className="tooltip left">
                        Click to change photo
                      </span> */}
                    </div>
                  </fieldset>
                  <div
                    id="addressDisplay"
                    onMouseOverCapture={() =>
                      this.props.SetMousePosition("", "")
                    }
                  >
                    {this.props.addressbook[this.props.selected].notMine
                      .length > 0
                      ? this.theirAddressLister()
                      : null}
                    {this.props.addressbook[this.props.selected].mine.length > 0
                      ? this.myAddressLister()
                      : null}
                  </div>
                  <div id="buttonholder">
                    <button
                      className="button ghost hero"
                      onClick={() => this.addAddressHandler()}
                    >
                      Add Address
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <h1 style={{ alignSelf: "center" }}>Your addressbook is empty</h1>
          )}
        </div>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Addressbook);
