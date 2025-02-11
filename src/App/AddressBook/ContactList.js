import { atom, useAtomValue } from 'jotai';
import styled from '@emotion/styled';

import AddEditContactModal from 'components/AddEditContactModal';
import { openModal } from 'lib/ui';
import { contactsAtom, searchQueryAtom } from 'lib/addressBook';
import { useCoreConnected } from 'lib/coreInfo';
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

const filteredContactsAtom = atom((get) => {
  const contacts = get(contactsAtom);
  const searchQuery = get(searchQueryAtom);
  return contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.addresses.find(({ address }) => address === searchQuery)
  );
});

export default function ContactList() {
  const filteredContacts = useAtomValue(filteredContactsAtom);
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
