// External
import React from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

// Internal
import UIController from 'components/UIController';
import AddEditContactModal from './AddEditContactModal';
import Contact, { NewContactButton } from './Contact';

const ContactListComponent = styled.div(({ theme }) => ({
  gridArea: 'list',
  maxHeight: '100%',
  overflowY: 'auto',
  borderRight: `1px solid ${theme.mixer(0.125)}`,
  marginLeft: -30,
}));

const Separator = styled.div(({ theme }) => ({
  margin: '5px 30px',
  height: 1,
  background: theme.mixer(0.125),
}));

const mapStateToProps = ({ addressbook: { addressbook, searchQuery } }) => ({
  contacts: addressbook,
  searchQuery,
});

/**
 * List of contacts
 *
 * @class ContactList
 * @extends {Component}
 */
@connect(mapStateToProps)
class ContactList extends React.Component {
  createContact = () => {
    console.log('click');
    UIController.openModal(AddEditContactModal);
  };

  /**
   * render
   *
   * @returns
   * @memberof ContactList
   */
  render() {
    const { contacts, searchQuery } = this.props;

    return (
      <ContactListComponent>
        {contacts.map((contact, i) =>
          (contact.name &&
            contact.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (contact.mine &&
            contact.mine.find(address => address === searchQuery)) ||
          (contact.notMine &&
            contact.notMine.find(address => address === searchQuery)) ? (
            <Contact key={contact.name} contact={contact} index={i} />
          ) : null
        )}
        <Separator />
        <NewContactButton onClick={this.createContact} />
      </ContactListComponent>
    );
  }
}

export default ContactList;
