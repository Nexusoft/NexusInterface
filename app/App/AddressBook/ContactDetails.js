// External
import React from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

// Internal
import { deleteContact } from 'actions/addressbookActionCreators';
import Text from 'components/Text';
import Link from 'components/Link';
import Button from 'components/Button';
import Icon from 'components/Icon';
import Tooltip from 'components/Tooltip';
import NexusAddress from 'components/NexusAddress';
import UIController from 'components/UIController';
import timeZones from 'data/timeZones';
import { timing } from 'styles';
import trashIcon from 'images/trash.sprite.svg';
import editIcon from 'images/edit.sprite.svg';

import AddEditContactModal from './AddEditContactModal';

const ContactDetailsComponent = styled.div({
  gridArea: 'details',
  maxHeight: '100%',
  overflowY: 'auto',
  marginRight: -30,
  paddingRight: 30,
});

const SectionHeader = styled.div({
  fontSize: '1.2em',
  marginTop: '1.5em',
});

const Header = styled.div(({ theme }) => ({
  paddingBottom: 10,
  borderBottom: `1px solid ${theme.primary}`,
  display: 'flex',
  alignItems: 'center',
}));

const ContactName = styled.div(({ theme }) => ({
  color: theme.primary,
  fontSize: 20,
  textAlign: 'center',
  flexGrow: 1,
}));

const HeaderAction = styled.div(({ theme, danger }) => ({
  cursor: 'pointer',
  flexShrink: 0,
  color: theme.mixer(0.25),
  transition: `color ${timing.normal}`,
  '&:hover': {
    color: danger ? theme.danger : theme.foreground,
  },
}));

const DefaultLabel = styled.span({
  opacity: 0.66,
});

const SpaceSeparator = styled.div({
  height: '1em',
});

const FieldLabel = styled.div({
  width: '40%',
});

const FieldContent = styled.div({
  width: '60%',
});

const Field = ({ label, content }) => (
  <div className="flex mt1">
    <FieldLabel>{label}</FieldLabel>
    <FieldContent>
      {content || (
        <span className="dim">
          <Text id="AddressBook.NoInfo" />
        </span>
      )}
    </FieldContent>
  </div>
);

const getLocalTime = tz => {
  const now = new Date();
  const utc = new Date().getTimezoneOffset();
  now.setMinutes(now.getMinutes() + utc + parseInt(tz));

  let h = now.getHours();
  let m = now.getMinutes();
  let i = 'AM';
  if (h >= 12) {
    i = 'PM';
    h = h - 12;
  }
  if (h === 0) {
    h = '12';
  }
  if (m < 10) {
    m = `0${m}`;
  }

  return `${h}:${m} ${i}`;
};

/**
 * Contact details
 *
 * @class ContactDetails
 * @extends {Component}
 */
@connect(
  ({ addressbook: { addressbook, selectedContactIndex } }) => ({
    contact: addressbook[selectedContactIndex] || null,
  }),
  { deleteContact }
)
class ContactDetails extends React.Component {
  /**
   * render Addresses
   *
   * @memberof ContactDetails
   */
  renderAddresses = (addresses, name, isMine) =>
    addresses.map(({ address, label }, i) => (
      <NexusAddress
        key={i}
        address={address}
        label={
          label || (
            <DefaultLabel>
              <Text
                id={
                  isMine
                    ? 'AddressBook.MyAddressFor'
                    : 'AddressBook.TheirAddressWithName'
                }
                data={{ name }}
              />
            </DefaultLabel>
          )
        }
      />
    ));

  confirmDelete = () => {
    UIController.openConfirmDialog({
      question: (
        <Text
          id="AddressBook.DeleteQuestion"
          data={{ name: this.props.contact.name }}
        />
      ),
      yesSkin: 'danger',
      yesCallback: () => {
        this.props.deleteContact(this.props.contact.name);
      },
    });
  };

  editContact = () => {
    UIController.openModal(AddEditContactModal, {
      edit: true,
      contact: this.props.contact,
    });
  };

  /**
   * render
   *
   * @returns
   * @memberof ContactDetails
   */
  render() {
    const { contact } = this.props;
    if (!contact) return null;

    const tz = contact.timezone
      ? timeZones.find(t => t.value === contact.timezone)
      : null;

    return (
      <ContactDetailsComponent>
        <Header>
          <Tooltip.Trigger tooltip={<Text id="AddressBook.Delete" />}>
            <HeaderAction danger onClick={this.confirmDelete}>
              <Icon icon={trashIcon} />
            </HeaderAction>
          </Tooltip.Trigger>
          <ContactName>{contact.name}</ContactName>
          <Tooltip.Trigger tooltip={<Text id="AddressBook.Edit" />}>
            <HeaderAction onClick={this.editContact}>
              <Icon icon={editIcon} />
            </HeaderAction>
          </Tooltip.Trigger>
        </Header>

        <SectionHeader>
          <Text id="AddressBook.NexusAddresses" />
        </SectionHeader>

        {this.renderAddresses(contact.notMine, contact.name, false)}
        <SpaceSeparator />
        {this.renderAddresses(contact.mine, contact.name, true)}

        <SectionHeader>
          <Text id="AddressBook.OtherInfo" />
        </SectionHeader>

        <Field
          label={<Text id="AddressBook.Email" />}
          content={
            contact.email && (
              <Link as="a" href={`mailto:${contact.email}`}>
                {contact.email}
              </Link>
            )
          }
        />
        <Field
          label={<Text id="AddressBook.PhoneNo" />}
          content={contact.phoneNumber}
        />
        <Field
          label={<Text id="AddressBook.LocalTime" />}
          content={tz && `${getLocalTime(tz.value)} (${tz.offset})`}
        />
        <Field
          label={<Text id="AddressBook.Notes" />}
          content={contact.notes}
        />
      </ContactDetailsComponent>
    );
  }
}

export default ContactDetails;
