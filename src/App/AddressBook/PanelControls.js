// External
import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';
import googleanalytics from 'scripts/googleanalytics';

// Internal Global
import { searchContact } from 'actions/addressBook';
import Icon from 'components/Icon';
import Button from 'components/Button';
import TextField from 'components/TextField';
import Tooltip from 'components/Tooltip';
import MyAddressesModal from 'components/MyAddressesModal';
import { openModal } from 'actions/overlays';
import { isCoreConnected } from 'selectors';
import AddEditContactModal from 'components/AddEditContactModal';

// Icons
import exportIcon from 'images/export.sprite.svg';
import addContactIcon from 'images/add-contact.sprite.svg';
import searchIcon from 'images/search.sprite.svg';
import userIcon from 'images/user.sprite.svg';

const ControlIcon = styled(Icon)({
  width: 20,
  height: 20,
});

const SearchInput = styled(TextField)({
  marginLeft: '1em',
  fontSize: '.9375em',
  width: 200,
});

/**
 * A Searchbox to search for contacts
 *
 * @class SearchBox
 * @extends {Component}
 * @memberof PanelControls
 */
@connect(
  state => ({
    searchQuery: state.ui.addressBook.searchQuery,
  }),
  { searchContact }
)
class SearchBox extends Component {
  /**
   * Component's Renderable JSX
   *
   * @returns
   * @memberof SearchBox
   */
  render() {
    return (
      <SearchInput
        left={<Icon icon={searchIcon} className="space-right" />}
        placeholder={__('Search contact')}
        value={this.props.searchQuery}
        onChange={e => this.props.searchContact(e.target.value)}
      />
    );
  }
}

/**
 * The controls in the Panel Header of Address Book Page
 *
 * @class PanelControls
 * @extends {Component}
 */
@connect(
  state => ({
    addressBook: state.addressBook,
    coreConnected: isCoreConnected(state),
  }),
  { openModal }
)
class PanelControls extends Component {
  /**
   * Export the Address Book to a CSV File
   *
   * @memberof PanelControls
   */
  exportAddressBook = () => {
    googleanalytics.SendEvent('AddressBook', 'IOAddress', 'Export', 1);

    const rows = []; //Set up a blank array for each row
    let csvContent = 'data:text/csv;charset=utf-8,'; //Set formating
    //This is so we can have named columns in the export, this will be row 1
    let NameEntry = [
      'AccountName', //a
      'PhoneNumber', //b
      'TimeZone', //c
      'Notes', //d
    ];
    rows.push(NameEntry); //how we get our header line
    Object.values(this.props.addressBook).map(e => {
      let tempentry = [];
      tempentry.push(e.name);
      tempentry.push(e.phoneNumber);

      tempentry.push(e.timeZone);
      tempentry.push(e.notes);
      // rows.push(tempentry); // moving down.
      let tempAddresses = [];

      if (e.addresses.length > 0) {
        e.addresses.map(add => {
          const label =
            add.label ||
            (add.isMine ? 'My Address for ' + e.name : e.name + "'s Address");
          tempAddresses.push([label, add.address]);
        });
        tempentry.push(tempAddresses);
      }
      rows.push(tempentry);
    });

    rows.forEach(function(rowArray) {
      let row = rowArray.join(',');
      csvContent += row + '\r\n';
    }); //format each row
    let encodedUri = encodeURI(csvContent); //Set up a uri, in Javascript we are basically making a Link to this file
    let link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'nexus-addressbook.csv'); //give link an action and a default name for the file. MUST BE .csv

    document.body.appendChild(link); // Required for FF

    link.click();

    document.body.removeChild(link);
  };

  /**
   * Opens Add/Edit Contact Modal
   *
   * @memberof PanelControls
   */
  showAddContact = () => {
    this.props.openModal(AddEditContactModal);
  };

  /**
   * Opens My Addresses Modal
   *
   * @memberof PanelControls
   */
  showMyAddresses = () => {
    this.props.openModal(MyAddressesModal);
  };

  /**
   * Component's Renderable JSX
   *
   * @returns {JSX}
   * @memberof PanelControls
   */
  render() {
    return (
      <div className="flex center">
        {this.props.coreConnected && (
          <Tooltip.Trigger tooltip={__('My Addresses')}>
            <Button
              skin="plain"
              className="relative"
              onClick={this.showMyAddresses}
            >
              <ControlIcon icon={userIcon} />
            </Button>
          </Tooltip.Trigger>
        )}

        {this.props.coreConnected && (
          <Tooltip.Trigger tooltip={__('New contact')}>
            <Button
              skin="plain"
              className="relative"
              onClick={this.showAddContact}
            >
              <ControlIcon icon={addContactIcon} />
            </Button>
          </Tooltip.Trigger>
        )}

        <Tooltip.Trigger tooltip={__('Export contacts')}>
          <Button
            skin="plain"
            className="relative"
            onClick={this.exportAddressBook}
          >
            <ControlIcon icon={exportIcon} />
          </Button>
        </Tooltip.Trigger>

        <SearchBox />
      </div>
    );
  }
}

export default PanelControls;
