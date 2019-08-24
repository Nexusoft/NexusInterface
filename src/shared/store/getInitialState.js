import { LoadTheme } from 'lib/theme';
import { LoadAddressBook } from 'lib/addressBook';
import settings from 'data/initialSettings';

export default function getInitialState() {
  const theme = LoadTheme();
  const addressBook = LoadAddressBook();

  return {
    settings,
    theme,
    addressBook,
  };
}
