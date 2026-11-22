// External
import { useSelector } from 'react-redux';
import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';
import { fade, mix } from 'utils/color';
import UT from 'lib/usageTracking';

// Internal Global
import { searchContact } from 'lib/addressBook';
import Icon from 'components/Icon';
import Button from 'components/Button';
import TextField from 'components/TextField';
import Tooltip from 'components/Tooltip';
import { openModal } from 'lib/ui';
import { isCoreConnected } from 'selectors';
import AddEditContactModal from 'components/AddEditContactModal';

// Icons
import exportIcon from 'icons/export.svg';
import addContactIcon from 'icons/add-contact.svg';
import searchIcon from 'icons/search.svg';

__ = __context('AddressBook');

const ControlIcon = styled(Icon)({
  width: 20,
  height: 20,
});

const SearchInput = styled(TextField)({
  marginLeft: '1em',
  fontSize: '.9375em',
  width: 200,
}, ({ theme }) => theme.modern && ({
  marginLeft: 'auto', width: 'min(420px, 100%)', minWidth: 0, flex: '0 1 420px',
  height: 42, borderRadius: 10, paddingLeft: 14,
  background: mix(theme.background, '#000000', 0.18), borderColor: fade(theme.primary, 0.8),
  '> svg': { width: 16, height: 16, flexShrink: 0, margin: 0, color: theme.primary },
  '> input': { flex: '1 1 0%', minWidth: 0, width: 0, paddingLeft: 10, fontSize: 13 },
  '&:focus-within': { borderColor: theme.primary },
  '@media (max-width: 600px)': { flexBasis: '100%', width: '100%' },
}));

const ToolbarButton = styled(Button)(({ theme }) => theme.modern && ({
  width: 42, height: 42, padding: 10, borderRadius: 10,
  color: theme.primary, background: fade(theme.primary, 0.94),
  '&:hover': { background: fade(theme.primary, 0.88), color: theme.primary },
}));

function SearchBox() {
  const { modern } = useTheme();
  const searchQuery = useSelector((state) => state.ui.addressBook.searchQuery);
  return (
    <SearchInput
      skin={modern ? 'filled-inverted' : 'underline'}
      aria-label={__('Search contact')}
      left={<Icon icon={searchIcon} className="mr0_4" />}
      placeholder={__('Search contact')}
      value={searchQuery}
      onChange={(e) => searchContact(e.target.value)}
    />
  );
}

function exportAddressBook(addressBook) {
  UT.ExportAddressBook();

  const rows = []; //Set up a blank array for each row
  let csvContent = 'data:text/csv;charset=utf-8,'; //Set formatting
  //This is so we can have named columns in the export, this will be row 1
  let NameEntry = [
    'AccountName', //a
    'PhoneNumber', //b
    'TimeZone', //c
    'Notes', //d
  ];
  rows.push(NameEntry); //how we get our header line
  Object.values(addressBook).map((e) => {
    let tempentry = [];
    tempentry.push(e.name);
    tempentry.push(e.phoneNumber);

    tempentry.push(e.timeZone);
    tempentry.push(e.notes);
    // rows.push(tempentry); // moving down.
    let tempAddresses = [];

    if (e.addresses.length > 0) {
      e.addresses.map((add) => {
        const label =
          add.label ||
          (add.isMine ? 'My Address for ' + e.name : e.name + "'s Address");
        tempAddresses.push([label, add.address]);
      });
      tempentry.push(tempAddresses);
    }
    rows.push(tempentry);
  });

  rows.forEach(function (rowArray) {
    let row = rowArray.join(',');
    csvContent += row + '\r\n';
  }); //format each row
  let encodedUri = encodeURI(csvContent); //Set up a uri, in Javascript we are basically making a Link to this file
  let link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', 'nexus-addressbook.csv'); //give link an action and a default name for the file. MUST BE .csv

  document.body.appendChild(link); // Required for FF

  link.click();

  document.body.removeChild(link);
}

export default function PanelControls() {
  const coreConnected = useSelector(isCoreConnected);
  const addressBook = useSelector((state) => state.addressBook);

  return (
    <div className="flex center">
      {coreConnected && (
        <Tooltip.Trigger tooltip={__('New contact')}>
          <ToolbarButton
            aria-label={__('New contact')}
            skin="plain"
            className="relative"
            onClick={() => {
              openModal(AddEditContactModal);
            }}
          >
            <ControlIcon icon={addContactIcon} />
          </ToolbarButton>
        </Tooltip.Trigger>
      )}

      <Tooltip.Trigger tooltip={__('Export contacts')}>
        <ToolbarButton skin="plain" className="relative" aria-label={__('Export contacts')} disabled={!addressBook || !Object.keys(addressBook).length} onClick={() => exportAddressBook(addressBook)}>
          <ControlIcon icon={exportIcon} />
        </ToolbarButton>
      </Tooltip.Trigger>

      <SearchBox />
    </div>
  );
}
