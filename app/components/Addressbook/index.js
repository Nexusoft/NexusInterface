/* 
  Title: Addressbook
  Description: This is where you manage your Nexus addresses 
  for your own wallet and the outside world. You can import 
  and export your addressbook here, add labels to addresses 
  as well as store important inforamtion about each of your 
  contacts.
  Last Modified by: Brian Smith
*/

// External Dependencies
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { remote } from "electron";
import { Link } from "react-router-dom";
import Modal from "react-responsive-modal";
import csv from "csvtojson";
import { callbackify } from "util";

// Internal Dependencies
import config from "../../api/configuration";
import * as RPC from "../../script/rpc";
import * as TYPE from "../../actions/actiontypes";
import * as actionsCreators from "../../actions/addressbookActionCreators";
import TimeZoneSelector from "./timeZoneSelector";
import ContextMenuBuilder from "../../contextmenu";
import styles from "./style.css";

// Images
import profilePlaceholder from "images/Profile_Placeholder.png";
import addressbookimg from "../../images/addressbook.svg";

// React-Redux mandatory methods
const mapStateToProps = state => {
  return {
    ...state.common,
    ...state.addressbook,
    ...state.overview,
    ...state.sendReceive
  };
};
const mapDispatchToProps = dispatch =>
  bindActionCreators(actionsCreators, dispatch);

class Addressbook extends Component {
  // React Method (Life cycle hook)
  componentDidMount() {
    this.loadMyAccounts();
    this.addressbookContextMenu = this.addressbookContextMenu.bind(this);
    window.addEventListener("contextmenu", this.addressbookContextMenu, false);
    this.props.googleanalytics.SendScreen("AddressBook");
  }
  // React Method (Life cycle hook)
  componentWillUnmount() {
    window.removeEventListener("contextmenu", this.addressbookContextMenu);
  }
  // React Method (Life cycle hook)
  componentDidUpdate(previousprops) {
    if (this.props.save) {
      config.WriteJson("addressbook.json", {
        addressbook: this.props.addressbook
      });
      this.props.ToggleSaveFlag();
    }
  }

  // Class methods
  addressbookContextMenu() {
    const txtTemplate = [
      {
        label: "Copy",
        accelerator: "CmdOrCtrl+C",
        role: "copy"
      },
      {
        label: "Paste",
        accelerator: "CmdOrCtrl+V",
        role: "paste"
      }
    ];

    const acctTemplate = [
      {
        label: "Copy",
        accelerator: "CmdOrCtrl+C",
        role: "copy"
      },
      {
        label: "Paste",
        accelerator: "CmdOrCtrl+V",
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
        accelerator: "CmdOrCtrl+C",
        role: "copy"
      },
      {
        label: "Paste",
        accelerator: "CmdOrCtrl+V",
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
              let indexDefault = accountsList.findIndex(ele => {
                if ( ele.account == "" || ele.account == "default")
                {
                  return ele;
                }
              });

              if (e.account === "" || e.account === "default")
              {
                if (index === -1 && indexDefault === -1) {
                  accountsList.push({
                    account: "default",
                    addresses: [e.address]
                  });
                }
                else
                {
                  accountsList[indexDefault].addresses.push(e.address);
                }
              }

              else{
                if (index === -1 ) {
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

  getinitial(name) {
    if (name && name.length >= 1) return name.charAt(0);
    return "M";
  }

  copyaddress(event) {
    event.preventDefault();
    let target = event.currentTarget;
    let address = event.target.innerText;
    console.log(target, address);
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

    this.props.OpenModal("Copied");
    setTimeout(() => {
      if (this.props.open) {
        this.props.CloseModal();
      }
    }, 3000);
  }

  MyAddressesTable() {
    let filteredAddress = this.props.myAccounts.filter(acct => {
      if (acct.account === "default") {
        let dummie = "My Account(default)";
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
          console.log(acct);
          
          return (
            <tr>
              <td key={acct + i} className="tdAccounts">
                {acct.account === "default" ? <span>My Account</span> : acct.account}
              </td>
              {acct.addresses.map(address => {
                return (
                  <td className="tdd" key={address + i}>
                    <span onClick={event => this.copyaddress(event)}>
                      {address}
                    </span>
                    <span key={address + i} className="tooltip">
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
            {index === -1 ? (
              <h2 className="m1">
                <img src={addressbookimg} className="hdr-img" />
                Add Contact
              </h2>
            ) : (
              <h2 className="m1">
                <img src={addressbookimg} className="hdr-img" />
                Edit Contact
              </h2>
            )}

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
            <button className="button" onClick={() => this.props.ToggleModal()}>
              Cancel
            </button>
          </div>
        );
        break;
      case "MY_ADDRESSES":
        if (this.props.myAccounts.length > 0) {
          return (
            <div id="Addresstable-wraper">
              <h2 className="m1">
                <img src={addressbookimg} className="hdr-img" />
                My Addresses
              </h2>
              <table className="myAddressTable">
                <thead className="AddressThead">
                  <th className="short-column">
                    Accounts
                    <input
                      className="searchaccount"
                      type="text"
                      placeholder="Search By Account"
                      value={this.props.Search}
                      onChange={e => this.props.SearchName(e.target.value)}
                      required
                    />
                  </th>
                </thead>
                {this.MyAddressesTable()}
              </table>
              <button
                className="button primary"
                onClick={() => this.props.SetModalType("NEW_MY_ADDRESS")}
              >
                Create New Address
              </button>
            </div>
          );
        } else return <h2>Please wait for Daemon to respond.</h2>;
        break;
      case "ADD_ADDRESS":
        return (
          <div>
            <h2 className="m1">
              <img src={addressbookimg} className="hdr-img" />
              Add Address To{" "}
              <span className="chosen">
                ({this.props.addressbook[this.props.selected].name})
              </span>
            </h2>
            <div className="create2">
              <label htmlFor="nxsaddress">Nexus Address</label>
              <input
                ref="addContactAddress"
                id="new-account-name"
                type="text"
                onChange={e => this.props.EditProtoAddress(e.target.value)}
                value={this.props.prototypeAddress}
                placeholder="Nexus Address"
              />
            </div>

            <button
              id="Add"
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
            <button
              id="back"
              className="button"
              onClick={() => this.props.ToggleModal()}
            >
              Cancel
            </button>
          </div>
        );
        break;
      case "NEW_MY_ADDRESS":
        return (
          <div>
            <h2 className="m1">
              <img src={addressbookimg} className="hdr-img" />
              Create
            </h2>
            <div className="create">
              <label htmlFor="new-account-name">Name (Optional)</label>
              <input
                ref="addContactName"
                id="new-account-name"
                type="text"
                value={this.props.prototypeName}
                onChange={e => this.props.EditProtoName(e.target.value)}
                placeholder="Enter Address Name"
                required
              />
            </div>{" "}
            <button
              id="Add"
              className="ghost button"
              onClick={() => this.createAddress()}
            >
              Create Address
            </button>
            <button
              id="back"
              className="button ghost"
              onClick={() => this.props.SetModalType("MY_ADDRESSES")}
            >
              Back
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
    let filteredAddress = this.props.addressbook.map((contact, i) => {
      if (
        contact.name
          .toLowerCase()
          .indexOf(this.props.contactSearch.toLowerCase()) !== -1
      ) {
        return `${contact.name}`;
      }
    });

    if (this.props.addressbook[0]) {
      return (
        <div
          id="contactList"
          onMouseOverCapture={() => this.props.SetMousePosition("", "")}
        >
          {this.props.addressbook.map((contact, i) => {
            let addTotal = contact.mine.length + contact.notMine.length;
            if (filteredAddress.includes(contact.name)) {
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
            } else {
              return null;
            }
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
    console.log(parseInt(this.props.addressbook[this.props.selected].timezone));
    d.setMinutes(d.getMinutes() + utc);
    d.setMinutes(
      d.getMinutes() +
        parseInt(this.props.addressbook[this.props.selected].timezone)
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
          onKeyDown={e => {
            if (e.which === 13 || e.which === 9) {
              this.props.SaveTz(
                this.props.selected,
                this.props.prototypeTimezone
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

  exportAddressBook() {
    this.props.googleanalytics.SendEvent(
      "AddressBook",
      "IOAddress",
      "Export",
      1
    );

    const rows = []; //Set up a blank array for each row
    let csvContent = "data:text/csv;charset=utf-8,"; //Set formating
    //This is so we can have named columns in the export, this will be row 1
    let NameEntry = [
      "AccountName", //a
      "PhoneNumber", //b
      "TimeZone", //c
      "Notes" //d
    ];
    rows.push(NameEntry); //how we get our header line
    this.props.addressbook.map(e => {
      let tempentry = [];
      tempentry.push(e.name);
      tempentry.push(e.phoneNumber);

      // let timezone = "";
      // switch (e.timezone) {
      //   case 840:
      //     timezone = "Line Islands";
      //     break;
      //   case 780:
      //     timezone = "Apia";
      //     break;
      //   case 765:
      //     timezone = "Chatham Islands";
      //     break;
      //   case 720:
      //     timezone = "Auckland";
      //     break;
      //   case 660:
      //     timezone = "Noumea";
      //     break;
      //   case 630:
      //     timezone = "Lord Howe Island";
      //     break;
      //   case 600:
      //     timezone = "Port Moresby";
      //     break;
      //   case 570:
      //     timezone = "Adelaide";
      //     break;
      //   case 540:
      //     timezone = "Tokyo";
      //     break;
      //   case 525:
      //     timezone = "Eucla";
      //     break;
      //   case 510:
      //     timezone = "Pyongyang";
      //     break;
      //   case 480:
      //     timezone = "Beijing";
      //     break;
      //   case 420:
      //     timezone = "Bangkok";
      //     break;
      //   case 390:
      //     timezone = "Yangon";
      //     break;
      //   case 360:
      //     timezone = "Almaty";
      //     break;
      //   case 345:
      //     timezone = "Kathmandu";
      //     break;
      //   case 330:
      //     timezone = "Delhi";
      //     break;
      //   case 300:
      //     timezone = "Karachi";
      //     break;
      //   case 270:
      //     timezone = "Kabul";
      //     break;
      //   case 240:
      //     timezone = "Dubai";
      //     break;
      //   case 210:
      //     timezone = "Tehran";
      //     break;
      //   case 180:
      //     timezone = "Moscow";
      //     break;
      //   case 120:
      //     timezone = "Athens";
      //     break;
      //   case 60:
      //     timezone = "Berlin";
      //     break;
      //   case 0:
      //     timezone = "London";
      //     break;
      //   case -60:
      //     timezone = "Cabo Verde";
      //     break;
      //   case -120:
      //     timezone = "Fernando de Noronha";
      //     break;
      //   case -180:
      //     timezone = "Buenos Aires";
      //     break;
      //   case -210:
      //     timezone = "Newfoundland";
      //     break;
      //   case -240:
      //     timezone = "Santiago";
      //     break;
      //   case -300:
      //     timezone = "New York";
      //     break;
      //   case -360:
      //     timezone = "Chicago";
      //     break;
      //   case -420:
      //     timezone = "Phoenix";
      //     break;
      //   case -480:
      //     timezone = "Los Angeles";
      //     break;
      //   case -540:
      //     timezone = "Anchorage";
      //     break;
      //   case -570:
      //     timezone = "Marquesas Islands";
      //     break;
      //   case -600:
      //     timezone = "Papeete";
      //     break;
      //   case -660:
      //     timezone = "Niue";
      //     break;
      //   case -720:
      //     timezone = "Baker Island";
      //     break;

      //   default:
      //     timezone = "blank";
      //     break;
      // }
      tempentry.push(e.timezone);
      tempentry.push(e.notes);
      // rows.push(tempentry); // moving down.
      let tempMine = [];

      let tempNotMine = [];
      if (e.mine.length > 0) {
        e.mine.map(add => {
          let label = "";
          if (add.label === "My Address for ") {
            label = add.label + e.name;
          } else {
            label = add.label;
          }
          tempMine.push([label, add.address]);
        });
        // rows.push(["", `My addresses for ${e.name}`, "", "", ""]);
        // rows.push(tempMine);
        tempentry.push(tempMine);
      }
      if (e.notMine.length > 0) {
        e.notMine.map(add => {
          let label = "";

          if (add.label === "'s Address") {
            label = e.name + add.label;
          } else {
            label = add.label;
          }
          tempNotMine.push([label, add.address]);
        });
        // rows.push(["", `${e.name}'s addresses`, "", "", ""]);
        // rows.push(tempNotMine);
        tempentry.push(tempNotMine);
      }
      rows.push(tempentry);
    });

    rows.forEach(function(rowArray) {
      let row = rowArray.join(",");
      csvContent += row + "\r\n";
    }); //format each row
    let encodedUri = encodeURI(csvContent); //Set up a uri, in Javascript we are basically making a Link to this file
    let link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "nexus-addressbook.csv"); //give link an action and a default name for the file. MUST BE .csv

    document.body.appendChild(link); // Required for FF
    this.props.OpenModal("Contacts Exported");
    setTimeout(() => {
      this.props.CloseModal();
    }, 3000);
    link.click(); //Finish by "Clicking" this link that will execute the download action we listed above
    document.body.removeChild(link);
  }

  importAddressBook(path) {
    this.props.googleanalytics.SendEvent(
      "AddressBook",
      "IOAddress",
      "Import",
      1
    );
    console.log("you got it again: ", path);
    csv()
      .fromFile(path)
      .then(jsonObj => {
        // console.log(jsonObj);
        for (var i = 0; i < jsonObj.length; i++) {
          console.log(jsonObj[i]);
          // dispatch a new account... (map it )
          var name = jsonObj[i].AccountName;
          var phone = jsonObj[i].PhoneNumber;
          var notes = jsonObj[i].Notes;
          var tz = jsonObj[i].TimeZone;
          var label;
          var address;
          for (var k in jsonObj[i]) {
            var key = k;
            var val = jsonObj[i][k];

            if (key.includes("field")) {
              var num = key.slice(5, key.length);
              if (num % 2 == 1) {
                label = val;
              } else {
                address = val;
                // (name, address, num, notes, TZ)
                this.props.AddContact(name, address, phone, notes, tz);
                // so here is where we have unique address label pairs, we should add this now.
                // also we don't really know how they had things labeled so we should check to see if they are ours or not.
                label = "";
                address = "";
              }
            }
          }
        }
      });
  }

  // Mandatory React method
  render() {
    return (
      <div id="addressbook" className="animated fadeIn">
        <Modal
          open={this.props.modalVisable}
          center
          onClose={this.props.ToggleModal}
          classNames={{ modal: "custom-modal4" }}
          onExited={this.props.clearPrototype}
        >
          {this.modalInternalBuilder()}
        </Modal>
        <h2>
          <img src={addressbookimg} className="hdr-img" />
          Address Book
        </h2>
        {this.props.connections === undefined ? null : (
          <div className="impexpblock">
            <a className="impexp" onClick={() => this.exportAddressBook()}>
              Export Contacts
            </a>
            <label htmlFor="importAddressbook">
              <a className="impexp">Import Contacts</a>
            </label>
            <input
              name="importAddressbook"
              id="importAddressbook"
              type="file"
              onChange={e => this.importAddressBook(e.target.files[0].path)}
            />
          </div>
        )}

        {this.props.connections === undefined ? (
          <div className="panel">
            {" "}
            <h2>Please wait for the daemon to load</h2>
          </div>
        ) : (
          <div className="panel">
            <div id="addressbook-controls">
              <div id="addressbook-search">
                <input
                  className="searchaccount"
                  type="text"
                  placeholder="Search Contact"
                  value={this.props.contactSearch}
                  onChange={e => this.props.ContactSearch(e.target.value)}
                  required
                />
              </div>

              <button
                className="button primary"
                onClick={() => {
                  this.props.clearSearch();
                  this.loadMyAccounts();
                  this.showMyAddresses();
                }}
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
                            onKeyDown={e => {
                              if (e.which === 13 || e.which === 9) {
                                this.props.SaveName(
                                  this.props.selected,
                                  this.props.prototypeName
                                );
                              }
                            }}
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
                                onKeyDown={e => {
                                  if (e.which === 13 || e.which === 9) {
                                    this.props.SavePhone(
                                      this.props.selected,
                                      this.props.prototypePhoneNumber
                                    );
                                  }
                                }}
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
                                  onKeyDown={e => {
                                    if (e.which === 13 || e.which === 9) {
                                      this.props.SaveNotes(
                                        this.props.selected,
                                        this.props.prototypeNotes
                                      );
                                    }
                                  }}
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
                                this.props.addressbook[this.props.selected]
                                  .imgSrc
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
                      {this.props.addressbook[this.props.selected].mine.length >
                      0
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
              <h1 style={{ alignSelf: "center" }}>
                Your Address Book has no contacts
              </h1>
            )}
          </div>
        )}
      </div>
    );
  }
}

// Mandatory React-Redux method
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Addressbook);
