import React, { Component } from "react";
import { connect } from "react-redux";
import { remote } from "electron";
import { Link } from "react-router-dom";
import Modal from "react-responsive-modal";

import config from "../../api/configuration";
import * as RPC from "../../script/rpc";
import * as TYPE from "../../actions/actiontypes";

import MyAddresses from "./MyAddresses";
import ContactList from "./ContactList";
import ContactView from "./ContactView";
import FormError from "./FormError";
import ContextMenuBuilder from "../../contextmenu";

import styles from "./style.css";

var psudoState = null;

const mapStateToProps = state => {
  return { ...state.common, ...state.addressbook };
};

// we will use the dispatch to push data into this page.
/* CRUD -> Create, {inherent Read}, Update, Delete
We are probably going to create an action creator file for this.
dispatch 1: add new address
dispatch 2: edit existing address
dispatch 3: edit phone number
dispatch 4: edit notes
dispatch 5: edit name // Not MVP
dispatch 6: edit label for address
dispatch 7: edit timezone
dispatch 8: delete contact
dispatch 9: delete contact address
dispatch 10: load addressbook (probably out at the app level.)
***** IF you add more don't forget to add actiontypes. *******
## MORE... Not done yet
dispatch 11: map myaddresses to accounts via label addNewAddress: (contact, label, address) => {
    dispatch({
      type: TYPE.ADD_NEW_ADDRESS,
      payload: { contact: contact, label: label, address: address }
    });
  },
  editExistingAddress: (contact, label, newaddress) => {
    dispatch({
      type: TYPE.EDIT_ADDRESS,
      payload: { contact: contact, label: label, newaddress: newaddress }
    });
  },
  editPhoneNumber: (contact, phone) => {
    dispatch({
      type: TYPE.EDIT_PHONE,
      payload: { contact: contact, phone: phone }
    });
  },
  editContactNotes: (contact, notes) => {
    dispatch({
      type: TYPE.EDIT_NOTES,
      payload: { contact: contact, notes: notes }
    });
  },
  editContactName: (contact, name, newname) => {
    dispatch({
      type: TYPE.EDIT_ADDRESS,
      payload: { contact: contact, name: name, newname: newname }
    });
  },
  editAddressLabel: (contact, label, address) => {
    dispatch({
      type: TYPE.EDIT_ADDRESS_LABEL,
      payload: { contact: contact, label: label, address: address }
    });
  },
  editContactTimezone: (contact, timezone) => {
    dispatch({
      type: TYPE.EDIT_TIMEZONE,
      payload: { contact: contact, timezone: timezone }
    });
  },
  deleteContact: contact => {
    dispatch({ type: TYPE.DELETE_CONTACT, payload: { contact: contact } });
  },
  deleteContactAddress: (contact, label, address) => {
    dispatch({
      type: TYPE.DELETE_ADDRESS_FROM_CONTACT,
      payload: { contact: contact, label: label, address: address }
    });
  }
*/
const mapDispatchToProps = dispatch => ({
  addNewAddress: (contact, label, address) => {
    dispatch({
      type: TYPE.ADD_NEW_ADDRESS,
      payload: { contact: contact, label: label, address: address }
    });
  },
  editExistingAddress: (contact, label, newaddress) => {
    dispatch({
      type: TYPE.EDIT_ADDRESS,
      payload: { contact: contact, label: label, newaddress: newaddress }
    });
  },
  editPhoneNumber: (contact, phone) => {
    dispatch({
      type: TYPE.EDIT_PHONE,
      payload: { contact: contact, phone: phone }
    });
  },
  editContactNotes: (contact, notes) => {
    dispatch({
      type: TYPE.EDIT_NOTES,
      payload: { contact: contact, notes: notes }
    });
  },
  editContactName: (contact, name, newname) => {
    dispatch({
      type: TYPE.EDIT_ADDRESS,
      payload: { contact: contact, name: name, newname: newname }
    });
  },
  editAddressLabel: (contact, label, address) => {
    dispatch({
      type: TYPE.EDIT_ADDRESS_LABEL,
      payload: { contact: contact, label: label, address: address }
    });
  },
  editContactTimezone: (contact, timezone) => {
    dispatch({
      type: TYPE.EDIT_TIMEZONE,
      payload: { contact: contact, timezone: timezone }
    });
  },
  deleteContact: contact => {
    dispatch({ type: TYPE.DELETE_CONTACT, payload: { contact: contact } });
  },
  deleteContactAddress: (contact, label, address) => {
    dispatch({
      type: TYPE.DELETE_ADDRESS_FROM_CONTACT,
      payload: { contact: contact, label: label, address: address }
    });
  }
});

class Addressbook extends Component {
  // Now that we have added the action creator above for addnewaddress we can use it.
  // this.props.addnewaddress(newaddress)
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // build()
  // {
  //   if (this.props.contacts) {
  //     const contacts = Object.keys(this.props.contacts).sort();
  //     return contacts.map(function(item, i){
  //       if (i === 0)
  //         return null;
  //       let contact = this.props.contacts[item];
  //       return (
  //       <li key={i} onClick={() => this.select(item)}>
  //         <span className="contact-avatar">
  //           <svg viewBox="0 0 100 100">
  //             <text x='50' y='50' dy='.35em'>
  //               {this.getinitial(item)}
  //             </text>
  //           </svg>
  //         </span>
  //         <span className="contact-name">{(item === "" ? "My Addresses" : item)}</span>
  //         <span className="contact-phone">{contact.phoneNum}</span>
  //         <span className="contact-addresses">{Object.keys(contact.notMine).length} Addresses</span>
  //       </li>
  //       )
  //     }.bind(this));
  //   }
  // }

  // getinitial(name)
  // {
  //   if (name && name.length >= 1)
  //     return name.charAt(0);
  //   return "M";  // My Addresses
  // }

  // select = (item) => {
  //   // get this by item name instead of index since we sorted the names list
  //   let index = Object.keys(this.props.contacts).indexOf(item);
  //   this.props.onSelect(index);
  // }

  // render() {
  //   return (
  //     <div id="addressbook-contacts">
  //       <ul>
  //         {this.build()}
  //       </ul>
  //     </div>
  //   );
  // }
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~``
  // From myaddresses.js
  /*
  buildmyaddresses() 
  {
    return Object.keys(this.props.contacts["myAccount"].mine).map(function(item, i){
      return (
        <tr className="contact-address">
          <td>{item}</td>
          <td className="address" key={i} data-address={this.props.contacts["myAccount"].mine[item]} onClick={this.copyaddress}>
            {this.props.contacts["myAccount"].mine[item]}
            <div className="tooltip left">Click to copy</div>
          </td>
        </tr>
      )
    }.bind(this));
  }
  
  copyaddress(event) 
  {
    event.preventDefault();
    let target = event.currentTarget;
    let address = target.dataset.address;
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
    target.classList.add("copied");
    setTimeout(function() {
      target.classList.remove("copied");
    }, 5000);
  }

  add = () => {
    this.props.onAddReceiveAddress(this.refs.addReceiveAddressLabel.value);
  }

  close = () => {
    this.props.onClose();
  }

  render() {
    if (!this.props.show || this.props.contacts === null)
    {
      return null;
    }
    return (
      <Modal 
      open={this.props.show} 
      onClose={this.close} 
      center 
      classNames={{ modal: 'modal addressbook-add-receive-addr-modal' }}>
        <div id="addressbook-my-addresses">
          <h3>
            My Addresses
          </h3>
          <div id="addressbook-my-addresses-inputs">
            <input ref="addReceiveAddressLabel" autoFocus type="text" placeholder="Label for new address"/>
            <button className="button primary" onClick={this.add}>Add Address</button>
          </div>
          <div id="my-addresses-list">
            <table>
              <thead>
                <th>Label</th>
                <th>Address</th>
              </thead>
              <tbody>
                {this.buildmyaddresses()}
              </tbody>
            </table>
          </div>
          <button className="button" onClick={this.close}>Close</button>
        </div>
      </Modal>
    );
  }
*/
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`
  static contextTypes = {
    router: React.PropTypes.object
  };

  // TODO: read the json file at app start so it can be put into state.
  // readAddressBook: Read the addressbook.json file and return the contents as an object, if it doesn't exist initialize the file
  // readAddressBook()
  // {
  //   let json = null;

  //   try {
  //     json = config.ReadJson("addressbook.json");

  //   }
  //   catch (err)
  //   {
  //     json = {};
  //     config.WriteJson("addressbook.json", json);
  //   }

  //   return json;
  // }

  // componentDidMount: get addressbook data
  // Anything that you are relying on being available for rendering the page from startup
  componentDidMount() {
    RPC.PROMISE("listaccounts", [0]).then(payload => {
      Promise.all(
        Object.keys(payload).map(elem => {
          return RPC.PROMISE("getaddressesbyaccount", [elem]);
        })
      ).then(this.processAddresses);
    });
    this.props.googleanalytics.SendScreen("AddressBook");
  }

  // TODO: Relocate to API saveAddressBook: save the address book to disk, then save the contacts state
  saveAddressBook(state) {
    config.WriteJson("addressbook.json", state);
    this.setState({
      contacts: state
    });
  }

  // loadAddressBook: Load the addressbook json and get the addresses from the core
  loadAddressBook(ResponseObject, Address, PostData) {
    if (ResponseObject.readyState != 4) return;
    if (ResponseObject.status == 200) {
      let getAddressesPromises = [];
      psudoState = this.readAddressBook();
      let results = JSON.parse(ResponseObject.responseText).result;
      if (psudoState.length === 0) {
        psudoState = Object.assign(psudoState, results);
      }
      let accounts = Object.keys(results);
      for (let i = 0; i < accounts.length; i++) {
        getAddressesPromises.push(
          RPC.PROMISE("getaddressesbyaccount", [accounts[i]])
        );
      }
      Promise.all(getAddressesPromises).then(this.processAddresses);
    }
  }

  // processAddresses: Process addresses that get returned from getaddressesbyaccount call to the core
  processAddresses = payload => {
    let validateAddressPromises = [];
    payload.map(element => {
      element.addresses.map(address => {
        validateAddressPromises.push(RPC.PROMISE("validateaddress", [address]));
      });
    });
    Promise.all(validateAddressPromises).then(this.processValidatedAddresses);
  };

  // processValidatedAddresses: Process validated addresses returned from validateaddress call to the core, then save the addressbook and set the default contact
  processValidatedAddresses = payload => {
    payload.map(this.processValidatedAddress);
    this.saveAddressBook(psudoState);
  };

  // processValidatedAddress: Process a validated address returned from validateaddress call to the core
  processValidatedAddress = (e, i) => {
    if (e.ismine) {
      if (typeof psudoState[e.account] !== "object") {
        psudoState[e.account] = {
          // numAddreses: 0,
          mine: {},
          notMine: {},
          phoneNum: null,
          timeZone: null,
          notes: null
        };
      }
      if (e.isvalid) {
        if (psudoState[e.account] || psudoState[e.account] === "myAccount") {
          if (!Object.values(psudoState[e.account].mine).includes(e.address)) {
            psudoState[e.account].mine = Object.assign(
              psudoState[e.account].mine,
              { [i]: e.address }
            );
          }
        }
      }
    } else {
      if (typeof psudoState[e.account] !== "object") {
        psudoState[e.account] = {
          mine: {},
          notMine: {},
          phoneNum: null,
          timeZone: null,
          notes: null
        };
      }
      if (e.isvalid) {
        if (psudoState[e.account] || psudoState[e.account] === "") {
          if (
            !Object.values(psudoState[e.account].notMine).includes(e.address)
          ) {
            psudoState[e.account].notMine = Object.assign(
              psudoState[e.account].notMine,
              { [i]: e.address }
            );
          }
        }
      }
    }
  };

  // setContact: set a contact as the selectedContact, then set state to show the contact
  setContact = index => {
    let name = Object.keys(this.state.contacts)[index];
    let contact = { name: name, index: index, ...this.state.contacts[name] };
    this.setState({
      selectedContact: contact,
      showViewContact: true,
      showEditContact: false
    });
  };

  // showMyAddresses: show the my addresses modal
  showMyAddresses = () => {
    this.setState({
      showMyAddresses: true
    });
  };

  // showAddContact: show the add contact modal
  showAddContact = () => {
    this.setState({
      showAddContact: true
    });
  };

  // showEditContact: hide the view and show the edit contact screen
  showEditContact = () => {
    this.setState({
      showViewContact: false,
      showEditContact: true
    });
  };

  // closeViewContact: close the add contact modal
  closeViewContact = () => {
    this.setState({
      showViewContact: false
    });
  };

  // closeMyAddresses: close the my addresses modal
  closeMyAddresses = () => {
    this.setState({
      showMyAddresses: false
    });
  };

  // closeAddContact: close the add contact modal
  closeAddContact = () => {
    this.setState({
      showAddContact: false,
      addError: null
    });
  };

  // cancelEditContact: cancel editing the contact and return to the view screen
  cancelEditContact = () => {
    this.setState({
      showViewContact: true,
      showEditContact: false
    });
  };

  // addContact: add a new contact
  addContact = () => {
    let name = document.getElementById("new-account-name").value;
    let phone = document.getElementById("new-account-phone").value;
    let timezone = JSON.parse(
      document.getElementById("new-account-timezone").value
    );
    let address = document.getElementById("new-account-address").value;
    let notes = document.getElementById("new-account-notes").value;
    // Validate the name is not blank
    if (name.trim() === "") {
      this.setState({
        addError: "Please enter a contact name"
      });
      return;
    }
    // Validate that the address is a valid address
    RPC.PROMISE("validateaddress", [address])
      .then(payload => {
        // Add the address to the account
        RPC.PROMISE("setaccount", [address, name])
          .then(success => {
            let newState = { ...this.state.contacts };
            newState[name] = {
              mine: {},
              notMine: {
                Primary: address
              },
              phoneNum: phone.trim(),
              timeZone: timezone,
              notes: notes.trim()
            };
            this.saveAddressBook(newState);
            this.closeAddContact();
          })
          .catch(e => {
            this.setState({
              addError: "Error adding address to the account: " + e
            });
          });
      })
      .catch(e => {
        this.setState({
          addError: "Please enter a valid Nexus address"
        });
      });
  };

  // updateContact: called when the edit contact process is complete, find and update the contact in the state and save it to disk then go back to the view contact page
  updateContact = contact => {
    let newState = { ...this.state.contacts };
    let updatedContact = {
      mine: contact.mine,
      notMine: contact.notMine,
      phoneNum: contact.phoneNum,
      timeZone: contact.timeZone,
      notes: contact.notes
    };
    if (contact.newNotMine) {
      Object.keys(contact.newNotMine).map(function(item, index) {
        updatedContact.notMine[item] = contact.newNotMine[item];
        //TODO: Right now we fire and forget the setaccount, the logic needs to be reorganized to make sure it only adds the contact if the call is successful. If the item is added to the new contact in the call it won't appear in the contact due to the async call
        RPC.PROMISE("setaccount", [
          contact.newNotMine[item],
          contact.name
        ]).then(success => {
          console.log("Contact added");
        });
      });
      delete contact.newNotMine; // prevents bug where same contact is edited twice and addresses get duplicated
    }
    newState[contact.name] = updatedContact;
    this.saveAddressBook(newState);
    this.setState({
      showViewContact: true,
      showEditContact: false
    });
  };

  // addReceiveAddress: add a new receive address for the wallet, these show in My Addresses
  addReceiveAddress = label => {
    // Get a new address, if an account is provided the new address will be a receive address
    // for that account, so transactions recieved at that address will be associated with the account
    //TODO: Do we need the ""
    RPC.PROMISE("getnewaddress", [""]).then(payload => {
      // Copy the old state to a new object and get a new receive address key
      let newState = { ...this.state.contacts };
      let newAddressKey =
        label === "" ? Object.keys(newState[""].mine).length : label;
      // Add new address to receive address list with new key
      newState[""].mine[newAddressKey] = payload;
      this.saveAddressBook(newState);
    });
  };

  // exportAddressBook: Export the address book to CSV format
  exportAddressBook() {
    const rows = []; //Set up a blank array for each row
    //This is so we can have named columns in the export, this will be row 1
    let NameEntry = [
      "Account Name",
      "Label",
      "Address",
      "Phone Number",
      "Time Zone",
      "Notes"
    ];
    rows.push(NameEntry);
    for (let account in this.state.contacts) {
      let accountname = "";
      // let mine = Array.from(psudoState[account].mine);
      let mine = Object.keys(this.state.contacts[account].mine).map(key => {
        return [key, this.state.contacts[account].mine[key]];
      });
      let notMine = Object.keys(this.state.contacts[account].notMine).map(
        key => {
          return [key, this.state.contacts[account].notMine[key]];
        }
      );
      if (account === "") {
        accountname = "Receive Addresses";
      } else {
        accountname = account;
      }
      let timezone = "";
      switch (this.state.contacts[account].timeZone) {
        case 0:
          timezone = "(UTC + 0.00hr)";
          break;
        case -60:
          timezone = "(UTC - 1.00hr)";
          break;
        case -120:
          timezone = "(UTC - 2.00hr)";
          break;
        case -180:
          timezone = "(UTC - 3.00hr)";
          break;
        case -210:
          timezone = "(UTC - 3.50hr)";
          break;
        case -240:
          timezone = "(UTC - 4.00hr)";
          break;
        case -300:
          timezone = "(UTC - 5.00hr)";
          break;
        case -360:
          timezone = "(UTC - 6.00hr)";
          break;
        case -420:
          timezone = "(UTC - 7.00hr)";
          break;
        case -480:
          timezone = "(UTC - 8.00hr)";
          break;
        case -540:
          timezone = "(UTC - 9.00hr)";
          break;
        case -570:
          timezone = "(UTC - 9.50hr)";
          break;
        case -600:
          timezone = "(UTC - 10.00hr)";
          break;
        case -660:
          timezone = "(UTC - 11.00hr)";
          break;
        case -720:
          timezone = "(UTC - 12.00hr)";
          break;
        case 840:
          timezone = "(UTC + 14.00hr)";
          break;
        case 780:
          timezone = "(UTC + 13.00hr)";
          break;
        case 765:
          timezone = "(UTC + 12.75hr)";
          break;
        case 720:
          timezone = "(UTC + 12.00hr)";
          break;
        case 660:
          timezone = "(UTC + 11.00hr)";
          break;
        case 630:
          timezone = "(UTC + 10.50hr)";
          break;
        case 600:
          timezone = "(UTC + 10.00hr)";
          break;
        case 570:
          timezone = "(UTC + 9.50hr)";
          break;
        case 540:
          timezone = "(UTC + 9.00hr)";
          break;
        case 525:
          timezone = "(UTC + 8.75hr)";
          break;
        case 510:
          timezone = "(UTC + 8.50hr)";
          break;
        case 480:
          timezone = "(UTC + 8.00hr)";
          break;
        case 420:
          timezone = "(UTC + 7.00hr)";
          break;
        case 390:
          timezone = "(UTC + 6.50hr)";
          break;
        case 360:
          timezone = "(UTC + 6.00hr)";
          break;
        case 345:
          timezone = "(UTC + 5.75hr)";
          break;
        case 330:
          timezone = "(UTC + 5.50hr)";
          break;
        case 300:
          timezone = "(UTC + 5.00hr)";
          break;
        case 270:
          timezone = "(UTC + 4.50hr)";
          break;
        case 240:
          timezone = "(UTC + 4.00hr)";
          break;
        case 210:
          timezone = "(UTC + 3.50hr)";
          break;
        case 180:
          timezone = "(UTC + 3.00hr)";
          break;
        case 120:
          timezone = "(UTC + 2.00hr)";
          break;
        case 60:
          timezone = "(UTC + 1.00hr)";
          break;
        default:
          timezone = this.state.contacts[account].timeZone;
          break;
      }

      let tempentry = [
        accountname,
        "",
        "",
        this.state.contacts[account].phoneNum,
        timezone,
        this.state.contacts[account].notes
      ];
      rows.push(tempentry);
      mine.map(arr => {
        let isnum = /^\d+$/.test(arr[0]);
        if (isnum) {
          arr[0] = "My Address";
        }
        rows.push(["", arr[0], arr[1], "", "", ""]);
      });
      notMine.map(arr => {
        let isnum = /^\d+$/.test(arr[0]);
        if (isnum) {
          arr[0] = "Their Address";
        }
        rows.push(["", arr[0], arr[1], "", "", ""]);
      });
    }
    let csvContent = "data:text/csv;charset=utf-8,"; //Set formating
    rows.forEach(function(rowArray) {
      let row = rowArray.join(",");
      csvContent += row + "\r\n";
    }); //format each row

    let encodedUri = encodeURI(csvContent); //Set up a uri, in Javascript we are basically making a Link to this file
    let link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "nexus-addressbook.csv"); //give link an action and a default name for the file. MUST BE .csv
    document.body.appendChild(link); // Required for FF
    link.click(); //Finish by "Clicking" this link that will execute the download action we listed above
  }

  // render: render the component
  render() {
    return (
      <div id="addressbook">
        <h2>Address Book</h2>
        <a className="refresh" onClick={() => this.exportAddressBook()}>
          Export Contacts
        </a>
        <div className="panel">
          <div id="addressbook-controls">
            <div id="addressbook-search" />
            <button className="button ghost" onClick={this.showMyAddresses}>
              My Addresses
            </button>
            <button className="button primary" onClick={this.showAddContact}>
              Add Contact
            </button>
          </div>
          <ContactView
            show={this.state.showViewContact}
            onClose={this.closeViewContact}
            contact={this.state.selectedContact}
            onUpdate={this.updateContact}
            onEdit={this.showEditContact}
          />
          <Modal
            open={this.state.showAddContact}
            onClose={this.closeAddContact}
            center
            classNames={{ modal: "modal addressbook-add-contact-modal" }}
          >
            <h2>Add Contact</h2>
            <FormError error={this.state.addError} />
            <div className="field">
              <label htmlFor="new-account-name">Name</label>
              <input
                ref="addContactName"
                id="new-account-name"
                type="text"
                placeholder="Name"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="new-account-name">Phone #</label>
              <input id="new-account-phone" type="tel" placeholder="Phone #" />
            </div>
            <div className="contact-detail">
              <label>Local Time</label>
              <span>
                <select
                  ref="editTimeZone"
                  defaultValue={this.props.contact.timeZone}
                >
                  <option value="0">
                    {" "}
                    (UTC + 0.00 hr) London, Casablanca, Accra
                  </option>
                  <option value="-60">
                    (UTC - 1.00 hr) Cabo Verde, Ittoqqortoormiit, Azores Islands
                  </option>
                  <option value="-120">
                    (UTC - 2.00 hr) Fernando de Noronha, South Sandwich Islands
                  </option>
                  <option value="-180">
                    (UTC - 3.00 hr) Buenos Aires, Montevideo, São Paulo
                  </option>
                  <option value="-210">
                    (UTC - 3.50 hr) St. John's, Labrador, Newfoundland
                  </option>
                  <option value="-240">
                    (UTC - 4.00 hr) Santiago, La Paz, Halifax
                  </option>
                  <option value="-300">
                    (UTC - 5.00 hr) New York, Lima, Toronto
                  </option>
                  <option value="-360">
                    (UTC - 6.00 hr) Chicago, Guatemala City, Mexico City
                  </option>
                  <option value="-420">
                    (UTC - 7.00 hr) Phoenix, Calgary, Ciudad Juárez
                  </option>
                  <option value="-480">
                    (UTC - 8.00 hr) Los Angeles, Vancouver, Tijuana
                  </option>
                  <option value="-540">(UTC - 9.00 hr) Anchorage</option>
                  <option value="-570">
                    (UTC - 9.50 hr) Marquesas Islands
                  </option>
                  <option value="-600">
                    (UTC - 10.00 hr) Papeete, Honolulu
                  </option>
                  <option value="-660">
                    (UTC - 11.00 hr) Niue, Jarvis Island, American Samoa
                  </option>
                  <option value="-720">
                    (UTC - 12.00 hr) Baker Island, Howland Island
                  </option>
                  <option value="840">(UTC + 14.00 hr) Line Islands</option>
                  <option value="780">(UTC + 13.00 hr) Apia, Nukuʻalofa</option>
                  <option value="765">(UTC + 12.75 hr) Chatham Islands</option>
                  <option value="720">(UTC + 12.00 hr) Auckland, Suva</option>
                  <option value="660">
                    (UTC + 11.00 hr) Noumea, Federated States of Micronesia
                  </option>
                  <option value="630">(UTC + 10.50 hr) Lord Howe Island</option>
                  <option value="600">
                    (UTC + 10.00 hr) Port Moresby, Sydney, Vladivostok
                  </option>
                  <option value="570">(UTC + 9.50 hr) Adelaide</option>
                  <option value="540">
                    (UTC + 9.00 hr) Seoul, Tokyo, Yakutsk
                  </option>
                  <option value="525">(UTC + 8.75 hr) Eucla</option>
                  <option value="510">(UTC + 8.50 hr) Pyongyang</option>
                  <option value="480">
                    (UTC + 8.00 hr) Beijing, Singapore, Manila
                  </option>
                  <option value="420">
                    (UTC + 7.00 hr) Jakarta, Bangkok, Ho Chi Minh City
                  </option>
                  <option value="390">(UTC + 6.50 hr) Yangon</option>
                  <option value="360">
                    (UTC + 6.00 hr) Almaty, Dhaka, Omsk
                  </option>
                  <option value="345">(UTC + 5.75 hr) Kathmandu</option>
                  <option value="330">(UTC + 5.50 hr) Delhi, Colombo</option>
                  <option value="300">
                    (UTC + 5.00 hr) Karachi, Tashkent, Yekaterinburg
                  </option>
                  <option value="270">(UTC + 4.50 hr) Kabul</option>
                  <option value="240">
                    (UTC + 4.00 hr) Baku, Dubai, Samara
                  </option>
                  <option value="210">(UTC + 3.50 hr) Tehran</option>
                  <option value="180">
                    (UTC + 3.00 hr) Istanbul, Moscow, Nairobi
                  </option>
                  <option value="120">
                    (UTC + 2.00 hr) Athens, Cairo, Johannesburg
                  </option>
                  <option value="60">
                    (UTC + 1.00 hr) Berlin, Lagos, Madrid
                  </option>
                </select>
              </span>
            </div>

            <div className="field">
              <label htmlFor="new-account-notes">Notes</label>
              <textarea id="new-account-notes" rows="3" />
            </div>

            <div className="field">
              <label htmlFor="new-account-address">Nexus Address</label>
              <input
                ref="addContactAddress"
                id="new-account-address"
                type="text"
                placeholder="Nexus Address"
              />
            </div>

            <button className="button primary" onClick={this.addContact}>
              Add Contact
            </button>
            <button className="button" onClick={this.closeAddContact}>
              Cancel
            </button>
          </Modal>
        </div>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Addressbook);
