// External
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { remote } from 'electron';
import styled from '@emotion/styled';
import GA from 'lib/googleAnalytics';

// Internal Global
import Icon from 'components/Icon';
import Button from 'components/Button';
import Panel from 'components/Panel';
import { openModal } from 'lib/overlays';
import AddEditContactModal from 'components/AddEditContactModal';
import { isCoreConnected } from 'selectors';
import ContextMenuBuilder from 'contextmenu';

// Internal Local
import PanelControls from './PanelControls';
import ContactList from './ContactList';
import ContactDetails from './ContactDetails';

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
  coreConnected: isCoreConnected(state),
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
    GA.SendScreen('AddressBook');
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
   * @memberof AddressBook
   */
  setupcontextmenu(e) {
    e.preventDefault();
    const contextmenu = new ContextMenuBuilder().defaultContext;
    //build default
    let defaultcontextmenu = remote.Menu.buildFromTemplate(contextmenu);
    defaultcontextmenu.popup(remote.getCurrentWindow());
  }

  /**
   * Opens Add/Edit Contact Modal
   *
   * @memberof AddressBook
   */
  showAddContact = () => {
    openModal(AddEditContactModal);
  };

  /**
   * Component's Renderable JSX
   *
   * @returns
   * @memberof AddressBook
   */
  render() {
    const { addressBook, coreConnected } = this.props;

    return (
      <Panel
        icon={addressBookIcon}
        title={__('Address book')}
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
            <div className="dim">{__('Your address book is empty')}</div>
            {coreConnected && (
              <Button
                skin="plain"
                onClick={this.showAddContact}
                className="mt1"
              >
                <Icon icon={addContactIcon} className="space-right" />
                {__('Create new contact')}
              </Button>
            )}
          </div>
        )}
      </Panel>
    );
  }
}

export default AddressBook;
