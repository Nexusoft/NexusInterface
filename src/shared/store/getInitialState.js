import { LoadSettings } from 'lib/settings';
import { LoadTheme } from 'lib/theme';
import { LoadAddressBook } from 'lib/addressBook';

export default function getInitialState() {
  const settings = LoadSettings();
  const theme = LoadTheme();
  const addressBook = LoadAddressBook();

  return {
    settings,
    theme,
    addressBook,
  };
}
