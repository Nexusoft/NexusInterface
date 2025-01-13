import { loadTheme } from 'lib/theme';
import { loadAddressBook } from 'lib/addressBook';

export default function getInitialState() {
  const theme = loadTheme();
  const addressBook = loadAddressBook();

  return {
    theme,
    addressBook,
  };
}
