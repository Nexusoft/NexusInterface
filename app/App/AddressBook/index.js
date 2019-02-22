// External
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { remote } from 'electron';
import Text from 'components/Text';
import styled from '@emotion/styled';
import googleanalytics from 'scripts/googleanalytics';

// Internal Global
import Icon from 'components/Icon';
import Button from 'components/Button';
import Panel from 'components/Panel';
import UIController from 'components/UIController';
import ContextMenuBuilder from 'contextmenu';

// Internal Local
import PanelControls from './PanelControls';
import ContactList from './ContactList';
import ContactDetails from './ContactDetails';
import AddEditContactModal from './AddEditContactModal';

// Icons
import addressBookIcon from 'images/address-book.sprite.svg';
import addContactIcon from 'images/add-contact.sprite.svg';

const AddressBookLayout = styled.div({
  display: 'grid',
  gridTemplateAreas: '"list details"',
  gridTemplateColumns: '1fr 2fr',
  columnGap: 30,
  height: '100%',
});

const mapStateToProps = state => ({
  addressBook: state.addressBook,
  connections: state.overview.connections,
});

/**
 * The Address Book Page
 *
 * @class AddressBook
 * @extends {Component}
 */
@connect(mapStateToProps)
class AddressBook extends Component {
  state = {
    activeIndex: 0,
  };

  /**
   * componentDidMount
   *
   * @memberof AddressBook
   */
  componentDidMount() {
    window.addEventListener('contextmenu', this.setupcontextmenu, false);
    googleanalytics.SendScreen('AddressBook');
  }

  /**
   * componentWillUnmount
   *
   * @memberof AddressBook
   */
  componentWillUnmount() {
    window.removeEventListener('contextmenu', this.setupcontextmenu);
  }

  /**
   * Set up the context menu
   *
   * @param {*} e
   * @memberof SendPage
   */
  setupcontextmenu(e) {
    e.preventDefault();
    const contextmenu = new ContextMenuBuilder().defaultContext;
    //build default
    let defaultcontextmenu = remote.Menu.buildFromTemplate(contextmenu);
    defaultcontextmenu.popup(remote.getCurrentWindow());
  }

  /**
   *
   *
   * @memberof AddressBook
   */
  showAddContact = () => {
    UIController.openModal(AddEditContactModal);
  };

  /**
   * render
   *
   * @returns
   * @memberof AddressBook
   */
  render() {
    const { addressBook, connections } = this.props;

    return (
      <Panel
        icon={addressBookIcon}
        title={<Text id="AddressBook.AddressBook" />}
        controls={<PanelControls />}
        bodyScrollable={false}
      >
        {addressBook && Object.values(addressBook).length > 0 ? (
          <AddressBookLayout>
            <ContactList />
            <ContactDetails />
          </AddressBookLayout>
        ) : (
          <div style={{ marginTop: 50, textAlign: 'center' }}>
            <div className="dim">
              <Text id="AddressBook.Empty" />
            </div>
            {connections !== undefined && (
              <Button
                skin="blank-light"
                onClick={this.showAddContact}
                className="mt1"
              >
                <Icon icon={addContactIcon} spaceRight />
                <Text id="AddressBook.CreateNewContact" />
              </Button>
            )}
          </div>
        )}
      </Panel>
    );
  }
}

export default AddressBook;
