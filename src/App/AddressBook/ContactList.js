import { useSelector } from 'react-redux';
import { useAtomValue } from 'jotai';
import styled from '@emotion/styled';

import AddEditContactModal from 'components/AddEditContactModal';
import { openModal } from 'lib/ui';
import { contactsAtom } from 'lib/addressBook';
import { useCoreConnected } from 'lib/coreInfo';
import memoize from 'utils/memoize';

import Contact from './Contact';

__ = __context('AddressBook');

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

const filterContacts = memoize((contacts, searchQuery) =>
  contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.addresses.find(({ address }) => address === searchQuery)
  )
);

export default function ContactList() {
  const contacts = useAtomValue(contactsAtom);
  const searchQuery = useSelector((state) => state.ui.addressBook.searchQuery);
  const filteredContacts = filterContacts(contacts, searchQuery);
  const coreConnected = useCoreConnected();

  return (
    <ContactListComponent>
      {filteredContacts.map((contact) => (
        <Contact key={contact.name} contact={contact} />
      ))}
      {coreConnected && (
        <>
          <Separator />
          <Contact
            contact={null /* new contact */}
            onClick={() => {
              openModal(AddEditContactModal);
            }}
          />
        </>
      )}
    </ContactListComponent>
  );
}
