import { loadTheme } from 'lib/theme';
import { loadAddressBook } from 'lib/addressBook';
import { loadSessionCache } from 'lib/session';
import settings from 'data/initialSettings';

export default function getInitialState() {
  const theme = loadTheme();
  const addressBook = loadAddressBook();
  const sessionCache = loadSessionCache();

  return {
    settings,
    theme,
    addressBook,
    sessionCache,
  };
}
