import { loadTheme } from 'lib/theme';
import { loadAddressBook } from 'lib/addressBook';
import { loadUsernameByGenesis } from 'lib/username';
import settings from 'data/initialSettings';

export default function getInitialState() {
  const theme = loadTheme();
  const addressBook = loadAddressBook();
  const usernameByGenesis = loadUsernameByGenesis();

  return {
    settings,
    theme,
    addressBook,
    usernameByGenesis,
  };
}
