import { loadTheme } from 'lib/theme';
import { loadAddressBook } from 'lib/addressBook';
import settings from 'data/initialSettings';

export default function getInitialState() {
  const theme = loadTheme();
  const addressBook = loadAddressBook();

  return {
    settings,
    theme,
    addressBook,
  };
}
