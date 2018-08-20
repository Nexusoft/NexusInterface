import React, { Component } from "react";
import { connect } from "react-redux";
import { remote } from "electron";
import { Link } from "react-router-dom";
import Modal from 'react-responsive-modal';

import config from "../../api/configuration";
import * as RPC from "../../script/rpc";

import MyAddresses from "./MyAddresses";
import ContactList from "./ContactList";
import ContactView from "./ContactView";
import FormError from "./FormError";
import ContextMenuBuilder from "../../contextmenu";

import styles from "./style.css";

var psudoState = null;

const mapStateToProps = state => {
  return { ...state.common };
};

const mapDispatchToProps = dispatch => ({});

class Addressbook extends Component {

  static contextTypes = {
    router: React.PropTypes.object
  };

  constructor(props)
  {
    super(props);

    this.state =
    {
      hoveredover: false,

      contacts: null,
      selectedContact: null,
      showMyAddresses: false,
      showAddContact: false,
      showViewContact: false,
      showEditContact: false,
      addError: null
    };
  }

  //
  // componentDidMount: get addressbook data
  //

  componentDidMount() {

    RPC.GET("listaccounts", [0], this.loadAddressBook.bind(this));

    this.props.googleanalytics.SendScreen("AddressBook");
  }

  //
  // readAddressBook: Read the addressbook.json file and return the contents as an object, if it doesn't exist initialize the file
  //

  readAddressBook()
  {
    let json = null;

    try {
      json = config.ReadJson("addressbook.json");
      
    } 
    catch (err) 
    {
      json = {};
      config.WriteJson("addressbook.json", json);
    }

    return json;
  }

  //
  // saveAddressBook: save the address book to disk, then save the contacts state
  //

  saveAddressBook(state) {

    config.WriteJson("addressbook.json", state);

    this.setState(
      {
        contacts: state
      }
    );

  }

  //
  // loadAddressBook: Load the addressbook json and get the addresses from the core
  //

  loadAddressBook(ResponseObject, Address, PostData)
  {
    if (ResponseObject.readyState != 4)
      return;

    if (ResponseObject.status == 200)
    {
      let getAddressesPromises = [];
      
      psudoState = this.readAddressBook();

      let results = JSON.parse(ResponseObject.responseText).result;

      // if (psudoState === null)
      if (psudoState.length === 0)
      {
        psudoState = Object.assign(psudoState, results);
      }

      let accounts = Object.keys(results);

      for (let i = 0; i < accounts.length; i++) 
      {
        // let account = accounts[i];
        getAddressesPromises.push(RPC.PROMISE("getaddressesbyaccount", [accounts[i]]));
      }

      Promise.all(getAddressesPromises).then(this.processAddresses);
    }
  }

  //
  // processAddresses: Process addresses that get returned from getaddressesbyaccount call to the core
  //

  processAddresses = (payload) => {
  
    let validateAddressPromises = [];

    payload.map(element => {

      element.addresses.map(address => {
        validateAddressPromises.push(RPC.PROMISE("validateaddress", [address]));
      });

    });

    Promise.all(validateAddressPromises).then(this.processValidatedAddresses);

  }

  //
  // processValidatedAddresses: Process validated addresses returned from validateaddress call to the core, then save the addressbook and set the default contact
  //

  processValidatedAddresses = (payload) => {

      payload.map(this.processValidatedAddress);

      this.saveAddressBook(psudoState);

  }

  //
  // processValidatedAddress: Process a validated address returned from validateaddress call to the core
  //

  processValidatedAddress = (e, i) => {

      if (e.ismine)
      {
        if (typeof psudoState[e.account] !== "object")
        {

          psudoState[e.account] = {
            // numAddreses: 0,
            mine: {},
            notMine: {},
            phoneNum: null,
            timeZone: null,
            notes: null
          };

        }

        if (e.isvalid)
        {
          if (psudoState[e.account] || psudoState[e.account] === "myAccount")
          {
            if (!Object.values(psudoState[e.account].mine).includes(e.address))
            {

              psudoState[e.account].mine = Object.assign(
                psudoState[e.account].mine,
                { [i]: e.address }
              );

            }
          }
        }
      }
      else
      {

        if (typeof psudoState[e.account] !== "object")
        {

          psudoState[e.account] = {
            mine: {},
            notMine: {},
            phoneNum: null,
            timeZone: null,
            notes: null
          };

        }

        if (e.isvalid) {
          if (psudoState[e.account] || psudoState[e.account] === "")
          {
            if (!Object.values(psudoState[e.account].notMine).includes(e.address))
            {

              psudoState[e.account].notMine = Object.assign(
                psudoState[e.account].notMine,
                { [i]: e.address }
              );

            }
          }
        }
      }
  }

  //
  // setContact: set a contact as the selectedContact, then set state to show the contact
  //

  setContact = (index) => {

    let name = Object.keys(this.state.contacts)[index];
    let contact = {name: name, index: index, ...this.state.contacts[name]};

    this.setState({
      selectedContact: contact,
      showViewContact: true,
      showEditContact: false
    });

  };

  //
  // showMyAddresses: show the my addresses modal
  //

  showMyAddresses = () => {

    this.setState(
      {
        showMyAddresses: true
      }
    );

  }

  //
  // showAddContact: show the add contact modal
  //

  showAddContact = () => {

    this.setState(
      {
        showAddContact: true
      }
    );

  }

  //
  // showEditContact: hide the view and show the edit contact screen
  //

  showEditContact = () => {

    this.setState(
      {
        showViewContact: false,
        showEditContact: true
      }
    );

  }


  //
  // closeViewContact: close the add contact modal
  //

  closeViewContact = () => {

    this.setState(
      {
        showViewContact: false
      }
    );

  }

  //
  // closeMyAddresses: close the my addresses modal
  //

  closeMyAddresses = () => {
    
    this.setState(
      {
        showMyAddresses: false
      }
    );

  }

  //
  // closeAddContact: close the add contact modal
  //

  closeAddContact = () => {
    
    this.setState(
      {
        showAddContact: false,
        addError: null
      }
    );

  }

  //
  // cancelEditContact: cancel editing the contact and return to the view screen
  //

  cancelEditContact = () => {

    this.setState(
      {
        showViewContact: true,
        showEditContact: false
      }
    );

  }

  //
  // addContact: add a new contact
  //

  addContact = () => {
    
    let name = document.getElementById("new-account-name").value;
    let phone = document.getElementById("new-account-phone").value;
    let timezone = JSON.parse(document.getElementById("new-account-timezone").value);
    let address = document.getElementById("new-account-address").value;
    let notes = document.getElementById("new-account-notes").value;

    // Validate the name is not blank
    if (name.trim() === "")
    {
      this.setState(
        {
          addError: "Please enter a contact name"
        }
      );
      return;
    }

    // Validate that the address is a valid address
    RPC.PROMISE("validateaddress", [address])
      .then(payload => {

        // Add the address to the account
        RPC.PROMISE("setaccount", [address, name])
          .then(success => {

            let newState = {...this.state.contacts};

            newState[name] = {
              mine: {},
              notMine: {
                "Primary": address
              },
              phoneNum: phone.trim(),
              timeZone: timezone,
              notes: notes.trim()
            };

            this.saveAddressBook(newState);

            this.closeAddContact();

          })
          .catch(e => {

            this.setState(
              {
                addError: "Error adding address to the account: " + e
              }
            );

          });

      })
      .catch(e => {

        this.setState(
          {
            addError: "Please enter a valid Nexus address"
          }
        );

      });

  }

  //
  // updateContact: called when the edit contact process is complete, find and update the contact in the state and save it to disk then go back to the view contact page
  //

  updateContact = (contact) => {

    let newState = {...this.state.contacts};

    let updatedContact = {
      mine: contact.mine,
      notMine: contact.notMine,
      phoneNum: contact.phoneNum,
      timeZone: contact.timeZone,
      notes: contact.notes
    };

    if (contact.newNotMine)
    {

      Object.keys(contact.newNotMine).map(function(item, index)
      {

        updatedContact.notMine[item] = contact.newNotMine[item];

        //TODO: Right now we fire and forget the setaccount, the logic needs to be reorganized to make sure it only adds the contact if the call is successful. If the item is added to the new contact in the call it won't appear in the contact due to the async call

        RPC.PROMISE("setaccount", [contact.newNotMine[item], contact.name])
        .then(success => {

          console.log("Contact added");

        });

      });
      
      delete contact.newNotMine; // prevents bug where same contact is edited twice and addresses get duplicated

    }

    newState[contact.name] = updatedContact;

    this.saveAddressBook(newState);

    this.setState(
      {
        showViewContact: true,
        showEditContact: false
      }
    );

  }

  //
  // addReceiveAddress: add a new receive address for the wallet, these show in My Addresses
  //

  addReceiveAddress = (label) => {

    // Get a new address, if an account is provided the new address will be a receive address 
    // for that account, so transactions recieved at that address will be associated with the account

    //TODO: Do we need the "" 
    RPC.PROMISE("getnewaddress", [""])
      .then(payload => {

        // Copy the old state to a new object and get a new receive address key
        let newState = {...this.state.contacts};

        let newAddressKey = label === "" ? Object.keys(newState[""].mine).length : label;

        // Add new address to receive address list with new key
        newState[""].mine[newAddressKey] = payload;

        this.saveAddressBook(newState);

      });

  }

  //
  // exportAddressBook: Export the address book to CSV format
  //

  exportAddressBook()
  {

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
          timezone = "London";
          break;
        case -60:
          timezone = "Cabo Verde";
          break;
        case -120:
          timezone = "Fernando de Noronha";
          break;
        case -180:
          timezone = "Buenos Aires";
          break;
        case -210:
          timezone = "Newfoundland";
          break;
        case -240:
          timezone = "Santiago";
          break;
        case -300:
          timezone = "New York";
          break;
        case -360:
          timezone = "Chicago";
          break;
        case -420:
          timezone = "Phoenix";
          break;
        case -480:
          timezone = "Los Angeles";
          break;
        case -540:
          timezone = "Anchorage";
          break;
        case -570:
          timezone = "Marquesas Islands";
          break;
        case -600:
          timezone = "Papeete";
          break;
        case -660:
          timezone = "Niue";
          break;
        case -720:
          timezone = "Baker Island";
          break;
        case 840:
          timezone = "Line Islands";
          break;
        case 780:
          timezone = "Apia";
          break;
        case 765:
          timezone = "Chatham Islands";
          break;
        case 720:
          timezone = "Auckland";
          break;
        case 660:
          timezone = "Noumea";
          break;
        case 630:
          timezone = "Lord Howe Island";
          break;
        case 600:
          timezone = "Port Moresby";
          break;
        case 570:
          timezone = "Adelaide";
          break;
        case 540:
          timezone = "Tokyo";
          break;
        case 525:
          timezone = "Eucla";
          break;
        case 510:
          timezone = "Pyongyang";
          break;
        case 480:
          timezone = "Beijing";
          break;
        case 420:
          timezone = "Bangkok";
          break;
        case 390:
          timezone = "Yangon";
          break;
        case 360:
          timezone = "Almaty";
          break;
        case 345:
          timezone = "Kathmandu";
          break;
        case 330:
          timezone = "Delhi";
          break;
        case 300:
          timezone = "Karachi";
          break;
        case 270:
          timezone = "Kabul";
          break;
        case 240:
          timezone = "Dubai";
          break;
        case 210:
          timezone = "Tehran";
          break;
        case 180:
          timezone = "Moscow";
          break;
        case 120:
          timezone = "Athens";
          break;
        case 60:
          timezone = "Berlin";
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

  //
  // render: render the component
  //

  render() {

    return (

      <div id="addressbook">

        <h2>Address Book</h2>

        <a className="refresh" onClick={() => this.exportAddressBook()}>Export Contacts</a>

        <div className="panel">

          <div id="addressbook-controls">
            <div id="addressbook-search">
            </div>
            <button className="button ghost" onClick={this.showMyAddresses}>My Addresses</button>
            <button className="button primary" onClick={this.showAddContact}>Add Contact</button>
          </div>

          <ContactList
            contacts={this.state.contacts}
            onSelect={this.setContact} />

          <MyAddresses 
            show={this.state.showMyAddresses}
            onClose={this.closeMyAddresses}
            contacts={this.state.contacts}
            onAddReceiveAddress={this.addReceiveAddress} />

          <ContactView 
            show={this.state.showViewContact}
            onClose={this.closeViewContact}
            contact={this.state.selectedContact}
            onUpdate={this.updateContact}
            onEdit={this.showEditContact}/>

          <Modal 
            open={this.state.showAddContact} 
            onClose={this.closeAddContact} 
            center 
            classNames={{ modal: 'modal addressbook-add-contact-modal' }}>

            <h2 >Add Contact</h2>

            <FormError error={this.state.addError}/>

            <div className="field">
              <label htmlFor="new-account-name">Name</label>
              <input ref="addContactName" id="new-account-name" type="text" placeholder="Name" required/>
            </div>

            <div className="field">
              <label htmlFor="new-account-name">Phone #</label>
              <input id="new-account-phone" type="tel" placeholder="Phone #" />
            </div>

            <div className="field">
              <label htmlFor="new-account-timezone">Time Zone</label>
              <select id="new-account-timezone">
                <option value="0">London, Casablanca, Accra</option>
                <option value="-60">Cabo Verde, Ittoqqortoormiit, Azores Islands</option>
                <option value="-120">Fernando de Noronha, South Sandwich Islands</option>
                <option value="-180">Buenos Aires, Montevideo, São Paulo</option>
                <option value="-210">St. John's, Labrador, Newfoundland</option>
                <option value="-240">Santiago, La Paz, Halifax</option>
                <option value="-300">New York, Lima, Toronto</option>
                <option value="-360">Chicago, Guatemala City, Mexico City</option>
                <option value="-420">Phoenix, Calgary, Ciudad Juárez</option>
                <option value="-480">Los Angeles, Vancouver, Tijuana</option>
                <option value="-540">Anchorage</option>
                <option value="-570">Marquesas Islands</option>
                <option value="-600">Papeete, Honolulu</option>
                <option value="-660">Niue, Jarvis Island, American Samoa</option>
                <option value="-720">Baker Island, Howland Island</option>
                <option value="840">Line Islands</option>
                <option value="780">Apia, Nukuʻalofa</option>
                <option value="765">Chatham Islands</option>
                <option value="720">Auckland, Suva</option>
                <option value="660">Noumea, Federated States of Micronesia</option>
                <option value="630">Lord Howe Island</option>
                <option value="600">Port Moresby, Sydney, Vladivostok</option>
                <option value="570">Adelaide</option>
                <option value="540">Seoul, Tokyo, Yakutsk</option>
                <option value="525">Eucla</option>
                <option value="510">Pyongyang</option>
                <option value="480">Beijing, Singapore, Manila</option>
                <option value="420">Jakarta, Bangkok, Ho Chi Minh City</option>
                <option value="390">Yangon</option>
                <option value="360">Almaty, Dhaka, Omsk</option>
                <option value="345">Kathmandu</option>
                <option value="330">Delhi, Colombo</option>
                <option value="300">Karachi, Tashkent, Yekaterinburg</option>
                <option value="270">Kabul</option>
                <option value="240">Baku, Dubai, Samara</option>
                <option value="210">Tehran</option>
                <option value="180">Istanbul, Moscow, Nairobi</option>
                <option value="120">Athens, Cairo, Johannesburg</option>
                <option value="60">Berlin, Lagos, Madrid</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="new-account-notes">Notes</label>
              <textarea id="new-account-notes" rows="3"></textarea>
            </div>

            <div className="field">
              <label htmlFor="new-account-address">Nexus Address</label>
              <input ref="addContactAddress" id="new-account-address" type="text" placeholder="Nexus Address"/>
            </div>
            
            <button className="button primary" onClick={this.addContact}>Add Contact</button>
            <button className="button" onClick={this.closeAddContact}>Cancel</button>

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