import React, { Component } from "react";
import { connect } from "react-redux";
import { remote } from "electron";
import { Link } from "react-router-dom";
import Modal from "react-responsive-modal";

import config from "../../api/configuration";
import * as RPC from "../../script/rpc";
import * as TYPE from "../../actions/actiontypes";

// import MyAddresses from "./MyAddresses";
// import ContactList from "./ContactList";
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
dispatch 11: map myaddresses to accounts via label
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
  // componentDidMount: get addressbook data
  // Anything that you are relying on being available for rendering the page from startup

  // render: render the component
  render() {
    return (
      <div id="addressbook">
        <h2>Address Book</h2>
        <a className="refresh" onClick={() => this.exportAddressBook()}>
          Export Contacts
        </a>
        <div className="panel" />
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Addressbook);
