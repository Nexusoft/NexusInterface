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

const mapStateToProps = state => {
  return { ...state.common, ...state.addressbook };
};

const mapDispatchToProps = dispatch =>
  bindActionCreators(actionsCreators, dispatch);

class Addressbook extends Component {
  // componentDidMount: get addressbook data
  // Anything that you are relying on being available for rendering the page from startup
  componentDidMount() {
    let sortedBook = [{}];
    if (this.props.addressbook[0]) {
      sortedBook = this.props.addressbook.sort((a, b) => {
        var nameA = a.name.toUpperCase(); // ignore upper and lowercase
        var nameB = b.name.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }

        // names must be equal
        return 0;
      });
    }
    this.props.SelectedContact(sortedBook[0]);
  }

  getinitial(name) {
    if (name && name.length >= 1) return name.charAt(0);

    return "M"; // My Addresses
  }

  addContact() {
    this.props.AddContact(
      this.props.prototypeName,
      this.props.prototypeAddress,
      this.props.prototypePhoneNumber,
      this.props.prototypeNotes,
      this.props.prototypeTimezone
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
                onChange={e => this.props.EditProtoPhone(e.target.value)}
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
              onClick={() => this.addContact()}
            >
              {index === -1 ? "Add Contact" : "Edit Contact"}
            </button>
            <button className="button" onClick={() => this.props.ToggleModal()}>
              Cancel
            </button>
          </div>
        );
        break;

      default:
        break;
    }
  }

  contactLister() {
    if (this.props.addressbook[0]) {
      return (
        <div id="contactList">
          {this.props.addressbook
            .sort((a, b) => {
              var nameA = a.name.toUpperCase();
              var nameB = b.name.toUpperCase();
              if (nameA < nameB) {
                return -1;
              }
              if (nameA > nameB) {
                return 1;
              }
              return 0;
            })
            .map((contact, i) => {
              let addTotal = contact.mine.length + contact.notMine.length;
              return (
                <div
                  key={i}
                  onClick={() => this.props.SelectedContact(contact)}
                >
                  {contact.name} {addTotal}{" "}
                  {addTotal > 1 ? "addresses" : "address"}
                </div>
              );
            })}
        </div>
      );
    }
  }
  showAddContactModal() {
    this.props.SetModalType("ADD_CONTACT");
    this.props.ToggleModal();
  }
  // render: render the component
  render() {
    console.log(this.props);
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
              {this.props.addressbook.length > 0 && (
                <div>
                  <input type="text" />
                  <button id="searchContacts" />
                </div>
              )}
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
              <div id="contactDetailContainer">
                <fieldset id="contactDetails">
                  <legend>{this.props.selected.name}</legend>
                  <div />
                </fieldset>
              </div>
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
