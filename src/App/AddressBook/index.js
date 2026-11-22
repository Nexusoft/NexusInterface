import { moduleLayout } from 'utils/moduleStyles';
// External
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';
import GridTracers, { modernGridBackground } from 'components/GridTracers';
import { fade, mix } from 'utils/color';
import UT from 'lib/usageTracking';

// Internal Global
import Icon from 'components/Icon';
import Button from 'components/Button';
import Panel from 'components/Panel';
import RequireLoggedIn from 'components/RequireLoggedIn';
import { openModal } from 'lib/ui';
import AddEditContactModal from 'components/AddEditContactModal';
import { isCoreConnected, isLoggedIn } from 'selectors';

// Internal Local
import PanelControls from './PanelControls';
import ContactList from './ContactList';
import ContactDetails from './ContactDetails';
import ModernAddressBook from './ModernAddressBook';

// Icons
import addressBookIcon from 'icons/address-book.svg';
import addContactIcon from 'icons/add-contact.svg';

__ = __context('AddressBook');

const ModernPage = styled.section(({ theme }) => ({
  position: 'relative', width: '100%', height: '100%', minWidth: 0, minHeight: 0,
  display: 'flex', flexDirection: 'column', overflow: 'hidden',
  color: theme.foreground, ...modernGridBackground(theme),
}));

const Toolbar = styled.div(({ theme }) => ({
  position: 'relative', zIndex: 1, margin: '20px clamp(16px, 2vw, 28px) 0',
  padding: '12px 16px', minHeight: 64, borderRadius: 16,
  border: `1px solid ${fade(theme.primary, 0.8)}`,
  background: `linear-gradient(135deg, ${mix(theme.background, theme.primary, 0.055)}, ${theme.background})`,
  boxShadow: `inset 0 1px ${fade(theme.foreground, 0.96)}`,
  '& > div': { flexWrap: 'wrap', gap: 8 },
}));

const Body = styled.div(({ theme }) => ({
  position: 'relative', zIndex: 1, flex: 1, minHeight: 0,
  overflow: 'auto', padding: moduleLayout.pagePadding,
  '& > .address-book-empty': {
    marginTop: '0 !important', padding: '48px 24px', borderRadius: 16,
    border: `1px solid ${fade(theme.primary, 0.8)}`,
    background: `linear-gradient(135deg, ${mix(theme.background, theme.primary, 0.055)}, ${theme.background})`,
  },
}));

function AddressBookFrame({ children }) {
  const { modern } = useTheme();
  const loggedIn = useSelector(isLoggedIn);
  if (!modern) return (
    <Panel icon={addressBookIcon} title={__('Address book')} controls={loggedIn ? <PanelControls /> : undefined} bodyScrollable={false}>
      {children}
    </Panel>
  );
  return (
    <ModernPage>
      <GridTracers />
      <Body>{children}</Body>
    </ModernPage>
  );
}

const AddressBookLayout = styled.div({
  display: 'grid',
  gridTemplateAreas: '"list details"',
  gridTemplateColumns: '1fr 2fr',
  columnGap: 30,
  height: '100%',
}, ({ theme }) => theme.modern && ({
  minHeight: 0, minWidth: 0, gap: 20, alignItems: 'stretch',
  gridTemplateColumns: 'minmax(240px, 1fr) minmax(0, 2fr)',
  '@media (max-width: 800px)': {
    height: 'auto', gridTemplateAreas: '"list" "details"', gridTemplateColumns: 'minmax(0, 1fr)',
  },
}));

export default function AddressBook() {
  const { modern } = useTheme();
  const addressBook = useSelector((state) => state.addressBook);
  const coreConnected = useSelector(isCoreConnected);
  useEffect(() => {
    UT.SendScreen('AddressBook');
  }, []);

  if (modern) return <AddressBookFrame><RequireLoggedIn><ModernAddressBook /></RequireLoggedIn></AddressBookFrame>;

  return (
    <AddressBookFrame>
      <RequireLoggedIn>
      {addressBook && Object.values(addressBook).length > 0 ? (
        <AddressBookLayout>
          <ContactList />
          <ContactDetails />
        </AddressBookLayout>
      ) : (
        <div className="address-book-empty" style={{ marginTop: 50, textAlign: 'center' }}>
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
      </RequireLoggedIn>
    </AddressBookFrame>
  );
}
