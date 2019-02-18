// External
import React from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

// Internal
import Contact from './Contact';

const ContactListComponent = styled.div({
  gridArea: 'list',
  maxHeight: '100%',
  overflowY: 'auto',
});

const mapStateToProps = ({ addressbook: { addressbook, searchQuery } }) => ({
  contacts: addressbook,
  searchQuery,
});

/**
 * The Address Book Page
 *
 * @class ContactList
 * @extends {PureComponent}
 */
@connect(mapStateToProps)
class ContactList extends React.PureComponent {
  /**
   * render
   *
   * @returns
   * @memberof ContactList
   */
  render() {
    const { contacts, searchQuery } = this.props;
    const filteredContacts = !searchQuery
      ? contacts
      : contacts.filter(
          contact =>
            (contact.name && contact.name.includes(searchQuery)) ||
            (contact.mine &&
              contact.mine.find(address => address === searchQuery)) ||
            (contact.notMine &&
              contact.notMine.find(address => address === searchQuery))
        );

    return (
      <ContactListComponent>
        {filteredContacts.map((contact, i) => (
          <Contact key={contact.name} contact={contact} index={i} />
        ))}
      </ContactListComponent>
    );
  }
}

export default ContactList;
