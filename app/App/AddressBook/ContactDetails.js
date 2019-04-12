// External
import React from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

// Internal
import { deleteContact } from 'actions/addressBookActionCreators';
import Text from 'components/Text';
import ExternalLink from 'components/ExternalLink';
import Icon from 'components/Icon';
import Tooltip from 'components/Tooltip';
import NexusAddress from 'components/NexusAddress';
import UIController from 'components/UIController';
import AddEditContactModal from 'components/AddEditContactModal';
import timeZones from 'data/timeZones';
import { timing } from 'styles';
import trashIcon from 'images/trash.sprite.svg';
import editIcon from 'images/edit.sprite.svg';

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
  ({
    addressBook,
    ui: {
      addressBook: { selectedContactName },
    },
    core: {
      info: { connections },
    },
  }) => ({
    contact: addressBook[selectedContactName] || null,
    connections,
  }),
  { deleteContact }
)
class ContactDetails extends React.Component {
  /**
   *
   *
   * @memberof ContactDetails
   */
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

  /**
   *
   *
   * @memberof ContactDetails
   */
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
    const { contact, connections } = this.props;
    if (!contact) return null;

    const tz =
      typeof contact.timeZone === 'number'
        ? timeZones.find(t => t.value === contact.timeZone)
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
          {connections !== undefined ? (
            <Tooltip.Trigger tooltip={<Text id="AddressBook.Edit" />}>
              <HeaderAction onClick={this.editContact}>
                <Icon icon={editIcon} />
              </HeaderAction>
            </Tooltip.Trigger>
          ) : (
            <div style={{ width: '1em' }} />
          )}
        </Header>

        <SectionHeader>
          <Text id="AddressBook.NexusAddresses" />
        </SectionHeader>

        {contact.addresses.map(({ address, label, isMine }, i) => (
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
                    data={{ name: contact.name }}
                  />
                </DefaultLabel>
              )
            }
          />
        ))}

        <SectionHeader>
          <Text id="AddressBook.ContactInfo" />
        </SectionHeader>

        <Field
          label={<Text id="AddressBook.Email" />}
          content={
            contact.email && (
              <ExternalLink href={`mailto:${contact.email}`}>
                {contact.email}
              </ExternalLink>
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
