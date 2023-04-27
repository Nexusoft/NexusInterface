// External
import { useSelector } from 'react-redux';
import styled from '@emotion/styled';

// Internal
import ExternalLink from 'components/ExternalLink';
import Icon from 'components/Icon';
import Tooltip from 'components/Tooltip';
import NexusAddress from 'components/NexusAddress';
import QRButton from 'components/QRButton';
import AddEditContactModal from 'components/AddEditContactModal';
import { deleteContact } from 'lib/addressBook';
import { openModal } from 'lib/ui';
import { confirm } from 'lib/dialog';
import { isCoreConnected } from 'selectors';
import timeZones from 'data/timeZones';
import { timing, consts } from 'styles';
import trashIcon from 'icons/trash.svg';
import editIcon from 'icons/edit.svg';

__ = __context('AddressBook');

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

const UserID = styled.span({
  fontFamily: consts.monoFontFamily,
  wordBreak: 'break-all',
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
const getLocalTime = (tz) => {
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

export default function ContactDetails() {
  const contact = useSelector(
    ({
      addressBook,
      ui: {
        addressBook: { selectedContactName },
      },
    }) => addressBook[selectedContactName] || null
  );
  const coreConnected = useSelector(isCoreConnected);
  if (!contact) return null;

  const tz =
    typeof contact.timeZone === 'number'
      ? timeZones.find((t) => t.value === contact.timeZone)
      : null;

  return (
    <ContactDetailsComponent>
      <Header>
        <Tooltip.Trigger tooltip={__('Delete')}>
          <HeaderAction
            danger
            onClick={async () => {
              const confirmed = await confirm({
                question: __('Delete contact %{name}?', {
                  name: contact.name,
                }),
                skinYes: 'danger',
              });
              if (confirmed) {
                deleteContact(contact.name);
              }
            }}
          >
            <Icon icon={trashIcon} />
          </HeaderAction>
        </Tooltip.Trigger>
        <ContactName>{contact.name}</ContactName>
        {coreConnected ? (
          <Tooltip.Trigger tooltip={__('Edit')}>
            <HeaderAction
              onClick={() => {
                openModal(AddEditContactModal, {
                  edit: true,
                  contact: contact,
                });
              }}
            >
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
          className="mt1"
          key={i}
          address={address}
          label={
            <div className="flex center space-between">
              <div>
                {label || (
                  <DefaultLabel>
                    {isMine
                      ? __('My address for %{name}', {
                          name: contact.name,
                        })
                      : __("%{name}'s Address", {
                          name: contact.name,
                        })}
                  </DefaultLabel>
                )}
              </div>
              <QRButton address={address} />
            </div>
          }
        />
      ))}

      <SectionHeader>{__('Contact info')}</SectionHeader>

      <Field
        label={__('Nexus user ID')}
        content={!!contact.genesis && <UserID>{contact.genesis}</UserID>}
      />
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
