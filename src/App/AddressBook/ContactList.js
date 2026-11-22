import { useSelector } from 'react-redux';
import styled from '@emotion/styled';
import { fade, mix } from 'utils/color';

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
  ...(theme.modern && {
    minWidth: 0, minHeight: 0, marginLeft: 0, padding: 10, borderRadius: 16,
    border: `1px solid ${fade(theme.primary, 0.8)}`,
    background: `linear-gradient(135deg, ${mix(theme.background, theme.primary, 0.055)}, ${theme.background})`,
    boxShadow: `inset 0 1px ${fade(theme.foreground, 0.96)}`,
    '@media (max-width: 800px)': { maxHeight: 300 },
  }),
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
