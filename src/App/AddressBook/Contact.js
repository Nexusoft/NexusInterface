import styled from '@emotion/styled';
import { useAtomValue } from 'jotai';

import Tooltip from 'components/Tooltip';
import Icon from 'components/Icon';
import AddEditContactModal from 'components/AddEditContactModal';
import { deleteContact, selectedContactNameAtom } from 'lib/addressBook';
import { openModal } from 'lib/ui';
import { confirm } from 'lib/dialog';
import { popupContextMenu } from 'lib/contextMenu';
import { useCoreConnected } from 'lib/coreInfo';
import { timing } from 'styles';
import * as color from 'utils/color';
import { defaultMenu } from 'lib/contextMenu';
import { jotaiStore } from 'store';
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

    '&:hover': {
      background: theme.mixer(0.05),
    },
  }),
  ({ selected, theme }) =>
    selected && {
      '&, &:hover': {
        background: color.fade(theme.primary, 0.4),
        color: theme.primaryAccent,
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
}));

// contact=null -> New Contact button
export default function Contact({ contact, ...rest }) {
  const coreConnected = useCoreConnected();
  const selectedContactName = useAtomValue(selectedContactNameAtom);
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
      onClick={() => {
        jotaiStore.set(selectedContactNameAtom, contact.name);
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
    <ContactComponent {...rest}>
      <ContactAvatar>
        <Icon icon={plusIcon} style={{ fontSize: '.8em', opacity: 0.7 }} />
      </ContactAvatar>
      <ContactName style={{ opacity: 0.7 }}>{__('New contact')}</ContactName>
    </ContactComponent>
  );
}
