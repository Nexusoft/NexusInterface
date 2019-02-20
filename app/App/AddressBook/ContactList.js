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

const mapStateToProps = ({
  addressbook: { addressbook },
  ui: {
    addressBook: { searchQuery },
  },
  overview: { connections },
}) => ({
  contacts: addressbook,
  searchQuery,
  connections,
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
    const { contacts, searchQuery, connections } = this.props;

    return (
      <ContactListComponent>
        {Object.values(contacts).map(contact =>
          contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contact.addresses.find(({ address }) => address === searchQuery) ? (
            <Contact key={contact.name} contact={contact} />
          ) : null
        )}
        {connections !== undefined && (
          <>
            <Separator />
            <NewContactButton onClick={this.createContact} />
          </>
        )}
      </ContactListComponent>
    );
  }
}

export default ContactList;
