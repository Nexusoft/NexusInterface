import { LoadTheme } from 'lib/theme';
import { loadAddressBook } from 'lib/addressBook';
import settings from 'data/initialSettings';

export default function getInitialState() {
  const theme = LoadTheme();
  const addressBook = loadAddressBook();

  return {
    settings,
    theme,
    addressBook,
  };
}
