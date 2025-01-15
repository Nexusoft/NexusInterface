import { loadAddressBook } from 'lib/addressBook';

export default function getInitialState() {
  const addressBook = loadAddressBook();

  return {
    addressBook,
  };
}
