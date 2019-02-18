// External
import React from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

const ContactDetailsComponent = styled.div({
  gridArea: 'details',
  maxHeight: '100%',
  overflowY: 'auto',
});

const ContactName = styled.div(({ theme }) => ({
  paddingBottom: 10,
  borderBottom: `1px solid ${theme.primary}`,
  color: theme.primary,
  fontSize: 20,
  textAlign: 'center',
}));

/**
 * Contact details
 *
 * @class ContactDetails
 * @extends {Component}
 */
@connect(({ addressbook: { addressbook, selectedContactIndex } }) => ({
  contact: addressbook[selectedContactIndex] || null,
}))
class ContactDetails extends React.Component {
  /**
   * render
   *
   * @returns
   * @memberof ContactDetails
   */
  render() {
    const { contact } = this.props;
    if (!contact) return null;

    return (
      <ContactDetailsComponent>
        <ContactName>{contact.name}</ContactName>
      </ContactDetailsComponent>
    );
  }
}

export default ContactDetails;
