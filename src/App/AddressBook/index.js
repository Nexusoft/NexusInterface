// External
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import styled from '@emotion/styled';
import UT from 'lib/usageTracking';

// Internal Global
import Icon from 'components/Icon';
import Button from 'components/Button';
import Panel from 'components/Panel';
import { openModal } from 'lib/ui';
import { useCoreConnected } from 'lib/coreInfo';
import AddEditContactModal from 'components/AddEditContactModal';

// Internal Local
import PanelControls from './PanelControls';
import ContactList from './ContactList';
import ContactDetails from './ContactDetails';

// Icons
import addressBookIcon from 'icons/address-book.svg';
import addContactIcon from 'icons/add-contact.svg';

__ = __context('AddressBook');

const AddressBookLayout = styled.div({
  display: 'grid',
  gridTemplateAreas: '"list details"',
  gridTemplateColumns: '1fr 2fr',
  columnGap: 30,
  height: '100%',
});

export default function AddressBook() {
  const addressBook = useSelector((state) => state.addressBook);
  const coreConnected = useCoreConnected();
  useEffect(() => {
    UT.SendScreen('AddressBook');
  }, []);

  return (
    <Panel
      icon={addressBookIcon}
      title={__('Address book')}
      controls={<PanelControls />}
      bodyScrollable={false}
    >
      {addressBook && Object.values(addressBook).length > 0 ? (
        <AddressBookLayout>
          <ContactList />
          <ContactDetails />
        </AddressBookLayout>
      ) : (
        <div style={{ marginTop: 50, textAlign: 'center' }}>
          <div className="dim">{__('Your address book is empty')}</div>
          {coreConnected && (
            <Button
              skin="plain"
              onClick={() => {
                openModal(AddEditContactModal);
              }}
              className="mt1"
            >
              <Icon icon={addContactIcon} className="mr0_4" />
              {__('Create new contact')}
            </Button>
          )}
        </div>
      )}
    </Panel>
  );
}
