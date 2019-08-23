// External
import React from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

// Internal
import { deleteContact } from 'actions/addressBook';
import ExternalLink from 'components/ExternalLink';
import Icon from 'components/Icon';
import Tooltip from 'components/Tooltip';
import NexusAddress from 'components/NexusAddress';
import { openConfirmDialog, openModal } from 'actions/overlays';
import AddEditContactModal from 'components/AddEditContactModal';
import { isCoreConnected } from 'selectors';
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

/**
 * Returns a individual field
 * @memberof ContactDetails
 * @param {*} { label, content }
 */
const Field = ({ label, content }) => (
  <div className="flex mt1">
    <FieldLabel>{label}</FieldLabel>
    <FieldContent>
      {content || <span className="dim">{__('No information')}</span>}
    </FieldContent>
  </div>
);

/**
 * Get Local time
 *
 * @param {*} tz TimeZone
 * @returns {string} Hours:Minutes AM/PM
 */
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
  state => {
    const {
      addressBook,
      ui: {
        addressBook: { selectedContactName },
      },
    } = state;
    return {
      contact: addressBook[selectedContactName] || null,
      coreConnected: isCoreConnected(state),
    };
  },
  { deleteContact, openConfirmDialog, openModal }
)
class ContactDetails extends React.Component {
  /**
   * Opens a dialog to confirm contact delete
   *
   * @memberof ContactDetails
   */
  confirmDelete = () => {
    this.props.openConfirmDialog({
      question: __('Delete contact %{name}?', {
        name: this.props.contact.name,
      }),
      skinYes: 'danger',
      callbackYes: () => {
        this.props.deleteContact(this.props.contact.name);
      },
    });
  };

  /**
   * Opens the Add/Edit Contact modal
   *
   * @memberof ContactDetails
   */
  editContact = () => {
    this.props.openModal(AddEditContactModal, {
      edit: true,
      contact: this.props.contact,
    });
  };

  /**
   * Component's Renderable JSX
   *
   * @returns {JSX}
   * @memberof ContactDetails
   */
  render() {
    const { contact, coreConnected } = this.props;
    if (!contact) return null;

    const tz =
      typeof contact.timeZone === 'number'
        ? timeZones.find(t => t.value === contact.timeZone)
        : null;

    return (
      <ContactDetailsComponent>
        <Header>
          <Tooltip.Trigger tooltip={__('Delete')}>
            <HeaderAction danger onClick={this.confirmDelete}>
              <Icon icon={trashIcon} />
            </HeaderAction>
          </Tooltip.Trigger>
          <ContactName>{contact.name}</ContactName>
          {coreConnected ? (
            <Tooltip.Trigger tooltip={__('Edit')}>
              <HeaderAction onClick={this.editContact}>
                <Icon icon={editIcon} />
              </HeaderAction>
            </Tooltip.Trigger>
          ) : (
            <div style={{ width: '1em' }} />
          )}
        </Header>

        <SectionHeader>{__('NXS addresses')}</SectionHeader>

        {contact.addresses.map(({ address, label, isMine }, i) => (
          <NexusAddress
            key={i}
            address={address}
            label={
              label || (
                <DefaultLabel>
                  {isMine
                    ? __('My address for %{name}')
                    : __("%{name}'s Address", {
                        name: contact.name,
                      })}
                </DefaultLabel>
              )
            }
          />
        ))}

        <SectionHeader>{__('Contact info')}</SectionHeader>

        <Field
          label={__('Email')}
          content={
            contact.email && (
              <ExternalLink href={`mailto:${contact.email}`}>
                {contact.email}
              </ExternalLink>
            )
          }
        />
        <Field label={__('Phone Number')} content={contact.phoneNumber} />
        <Field
          label={__('Local Time')}
          content={tz && `${getLocalTime(tz.value)} (${tz.offset})`}
        />
        <Field label={__('Notes')} content={contact.notes} />
      </ContactDetailsComponent>
    );
  }
}

export default ContactDetails;
