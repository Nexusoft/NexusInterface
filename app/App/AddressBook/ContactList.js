// External
import React from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

// Internal
import Contact from './Contact';

const ContactListComponent = styled.div(({ theme }) => ({
  gridArea: 'list',
  maxHeight: '100%',
  overflowY: 'auto',
  borderRight: `1px solid ${theme.mixer(0.125)}`,
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
          (contact.name && contact.name.includes(searchQuery)) ||
          (contact.mine &&
            contact.mine.find(address => address === searchQuery)) ||
          (contact.notMine &&
            contact.notMine.find(address => address === searchQuery)) ? (
            <Contact key={contact.name} contact={contact} index={i} />
          ) : null
        )}
      </ContactListComponent>
    );
  }
}

export default ContactList;
