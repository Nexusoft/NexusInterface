import { modernIconButton } from 'utils/buttonStyles';
// External
import { useSelector } from 'react-redux';
import styled from '@emotion/styled';
import { fade, mix } from 'utils/color';
import { useTheme } from '@emotion/react';

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
}, ({ theme }) => theme.modern && ({
  minWidth: 0, minHeight: 0, marginRight: 0, padding: 24, borderRadius: 16,
  border: `1px solid ${fade(theme.primary, 0.8)}`,
  background: `linear-gradient(135deg, ${mix(theme.background, theme.primary, 0.055)}, ${theme.background})`,
  boxShadow: `inset 0 1px ${fade(theme.foreground, 0.96)}`,
  '& > .flex.mt1': { padding: '16px 0', marginTop: 0, gap: 20, borderBottom: `1px solid ${fade(theme.primary, 0.9)}`, fontSize: 13, lineHeight: 1.6 },
  '.empty-selection': { textAlign: 'center', color: theme.mixer(0.65), padding: '48px 0' },
  '@media (max-width: 480px)': { padding: 18, '& > .flex.mt1': { flexDirection: 'column', gap: 6 } },
}));

const ContactAddress = styled(NexusAddress)(({ theme }) => theme.modern && ({
  borderRadius: 12, border: `1px solid ${fade(theme.primary, 0.8)}`,
  '> div:first-of-type': { background: fade(theme.primary, 0.93), padding: '8px 14px', borderRadius: '11px 11px 0 0', fontSize: 12 },
  '> div:last-of-type': { background: fade(theme.background, 0.15), border: 0, borderRadius: '0 0 11px 11px', padding: '14px', minHeight: 64, fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' },
  '> div:last-of-type:hover': { background: fade(theme.primary, 0.94) },
  '.flex.space-between': { gap: 12 },
  '.flex.space-between > div': { minWidth: 0, overflowWrap: 'anywhere' },
}));

const SectionHeader = styled.div({
  fontSize: '1.2em',
  marginTop: '1.5em',
}, ({ theme }) => theme.modern && ({ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: theme.primary, margin: '28px 0 14px' }));

const Header = styled.div(({ theme }) => ({
  paddingBottom: 10,
  borderBottom: `1px solid ${theme.primary}`,
  display: 'flex',
  alignItems: 'center',
  ...(theme.modern && { paddingBottom: 18, gap: 16, borderBottomColor: fade(theme.primary, 0.8) }),
}));

const ContactName = styled.div(({ theme }) => ({
  color: theme.primary,
  fontSize: 20,
  textAlign: 'center',
  flexGrow: 1,
  ...(theme.modern && { fontSize: 24, fontWeight: 500, letterSpacing: '-0.4px', minWidth: 0, overflowWrap: 'anywhere' }),
}));

const HeaderAction = styled.button(({ theme, danger }) => ({
  border: 0, background: 'transparent', font: 'inherit',
  cursor: 'pointer',
  flexShrink: 0,
  color: theme.mixer(0.25),
  transition: `color ${timing.normal}`,
  ...(theme.modern && modernIconButton(theme, danger)),
  '&:hover': {
    color: danger ? mix(theme.danger, theme.foreground, 0.4) : theme.foreground,
  },
}));

const DefaultLabel = styled.span({
  opacity: 0.66,
});

const FieldLabel = styled.div({
  width: '40%',
}, ({ theme }) => theme.modern && ({ width: '30%', flexShrink: 0, color: theme.mixer(0.65), '@media (max-width: 480px)': { width: '100%' } }));

const FieldContent = styled.div({
  width: '60%',
}, ({ theme }) => theme.modern && ({ width: 'auto', flex: 1, minWidth: 0, overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }));

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
  const { modern } = useTheme();
  const contact = useSelector(
    ({
      addressBook,
      ui: {
        addressBook: { selectedContactName },
      },
    }) => addressBook[selectedContactName] || null
  );
  const coreConnected = useSelector(isCoreConnected);
  if (!contact) return modern ? <ContactDetailsComponent><p className="empty-selection">{__('Select a contact to view details')}</p></ContactDetailsComponent> : null;

  const tz =
    typeof contact.timeZone === 'number'
      ? timeZones.find((t) => t.value === contact.timeZone)
      : null;

  return (
    <ContactDetailsComponent>
      <Header>
        <Tooltip.Trigger tooltip={__('Delete')}>
          <HeaderAction
            type="button"
            aria-label={__('Delete contact')}
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
              type="button"
              aria-label={__('Edit contact')}
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
        <ContactAddress
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
