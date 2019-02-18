// External
import React from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

// Internal
import Text from 'components/Text';
import Link from 'components/Link';
import NexusAddress from 'components/NexusAddress';
import timeZones from 'data/timeZones';

const ContactDetailsComponent = styled.div({
  gridArea: 'details',
  maxHeight: '100%',
  overflowY: 'auto',
});

const SectionHeader = styled.div({
  fontSize: '1.2em',
  marginTop: '1.5em',
});

const ContactName = styled.div(({ theme }) => ({
  paddingBottom: 10,
  borderBottom: `1px solid ${theme.primary}`,
  color: theme.primary,
  fontSize: 20,
  textAlign: 'center',
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
@connect(({ addressbook: { addressbook, selectedContactIndex } }) => ({
  contact: addressbook[selectedContactIndex] || null,
}))
class ContactDetails extends React.Component {
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
        <ContactName>{contact.name}</ContactName>

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
      </ContactDetailsComponent>
    );
  }
}

export default ContactDetails;
