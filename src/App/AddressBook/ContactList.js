import { useSelector } from 'react-redux';
import styled from '@emotion/styled';

import AddEditContactModal from 'components/AddEditContactModal';
import { openModal } from 'lib/ui';
import { isCoreConnected } from 'selectors';

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

export default function ContactList() {
  const addressBook = useSelector((state) => state.addressBook);
  const searchQuery = useSelector((state) => state.ui.addressBook.searchQuery);
  const coreConnected = useSelector(isCoreConnected);

  return (
    <ContactListComponent>
      {Object.values(addressBook).map((contact) =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.addresses.find(({ address }) => address === searchQuery) ? (
          <Contact key={contact.name} contact={contact} />
        ) : null
      )}
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
