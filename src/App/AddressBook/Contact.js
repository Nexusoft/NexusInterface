import { useSelector } from 'react-redux';
import styled from '@emotion/styled';

import Tooltip from 'components/Tooltip';
import Icon from 'components/Icon';
import AddEditContactModal from 'components/AddEditContactModal';
import { selectContact, deleteContact } from 'lib/addressBook';
import { openModal } from 'lib/ui';
import { confirm } from 'lib/dialog';
import { popupContextMenu } from 'lib/contextMenu';
import { isCoreConnected } from 'selectors';
import { timing } from 'styles';
import * as color from 'utils/color';
import { defaultMenu } from 'lib/contextMenu';
import plusIcon from 'icons/plus.svg';

__ = __context('AddressBook');

const getinitial = (name) => (name && name.length >= 1 ? name.charAt(0) : '');

const ContactComponent = styled.div(
  ({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: '.4em 30px',
    transitionProperty: 'background, color',
    transitionDuration: timing.normal,
    cursor: 'pointer',
    ...(theme.modern && { padding: '14px 12px', marginBottom: 6, borderRadius: 12, borderLeft: '3px solid transparent', fontSize: 14 }),

    '&:hover': {
      background: theme.mixer(0.05),
    },
  }),
  ({ selected, theme }) =>
    selected && {
      '&, &:hover': {
        background: color.fade(theme.primary, theme.modern ? 0.88 : 0.4),
        color: theme.modern ? theme.primary : theme.primaryAccent,
        ...(theme.modern && { borderLeftColor: theme.primary }),
      },
    }
);

const ContactAvatar = styled.div(({ theme }) => ({
  width: '2em',
  height: '2em',
  borderRadius: '50%',
  background: theme.mixer(0.25),
  color: theme.foreground,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexShrink: 0,
  marginRight: '1em',
  ...(theme.modern && { background: color.fade(theme.primary, 0.9), color: theme.primary, width: 36, height: 36 }),
}));

const ContactName = styled.div({
  flexGrow: 1,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

const AddressesCount = styled.div(({ theme }) => ({
  fontSize: '.75em',
  padding: '0 6px',
  borderRadius: 2,
  background: theme.mixer(0.125),
  color: theme.mixer(0.875),
  flexShrink: 0,
  ...(theme.modern && { borderRadius: 20, padding: '2px 9px', color: theme.primary, background: color.fade(theme.primary, 0.92) }),
}));

// contact=null -> New Contact button
export default function Contact({ contact, ...rest }) {
  const coreConnected = useSelector(isCoreConnected);
  const selectedContactName = useSelector(
    (state) => state.ui.addressBook.selectedContactName
  );
  const editContact = () => {
    openModal(AddEditContactModal, {
      edit: true,
      contact: contact,
    });
  };
  const confirmDelete = async () => {
    const confirmed = await confirm({
      question: __('Delete contact %{name}?', {
        name: contact.name,
      }),
      skinYes: 'danger',
    });
    if (confirmed) {
      deleteContact(contact.name);
    }
  };
  const showContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const template = [...defaultMenu];
    if (coreConnected) {
      template.push({
        id: 'edit-contact',
        label: __('Edit contact'),
        click: editContact,
      });
    }
    template.push({
      id: 'delete-contact',
      label: __('Delete contact'),
      click: confirmDelete,
    });
    popupContextMenu(template);
  };

  return contact ? (
    <ContactComponent
      role="button"
      tabIndex={0}
      aria-pressed={contact.name === selectedContactName}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          selectContact(contact.name);
        }
      }}
      onClick={() => {
        selectContact(contact.name);
      }}
      selected={contact.name === selectedContactName}
      onContextMenu={showContextMenu}
    >
      <ContactAvatar>{getinitial(contact.name)}</ContactAvatar>
      <ContactName>{contact.name}</ContactName>
      <Tooltip.Trigger
        tooltip={__(
          '%{smart_count} address |||| %{smart_count} addresses',
          contact.addresses.length
        )}
      >
        <AddressesCount>{contact.addresses.length}</AddressesCount>
      </Tooltip.Trigger>
    </ContactComponent>
  ) : (
    <ContactComponent role="button" tabIndex={0} onKeyDown={(event) => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); rest.onClick?.(); }
    }} {...rest}>
      <ContactAvatar>
        <Icon icon={plusIcon} style={{ fontSize: '.8em', opacity: 0.7 }} />
      </ContactAvatar>
      <ContactName style={{ opacity: 0.7 }}>{__('New contact')}</ContactName>
    </ContactComponent>
  );
}
