import config from 'api/configuration';
import { emailRegex } from 'utils/form';

const fileName = 'addressbook.json';

/**
 * Convert the old addressbook.json schema
 * =============================================================================
 */
function convertOldAddressBook(addressbook) {
  return addressbook.reduce(
    (obj, contact) => ({
      ...obj,
      [contact.name]: contact && convertOldContact(contact),
    }),
    {}
  );
}

function convertOldContact({
  name,
  mine,
  notMine,
  phoneNumber,
  timezone,
  notes,
}) {
  return {
    name,
    addresses: [...notMine, ...mine].map(
      info => info && convertOldAddressInfo(info)
    ),
    phoneNumber,
    timeZone: timezone,
    notes,
  };
}

function convertOldAddressInfo({ label, address, isMine }) {
  return {
    label:
      label === "'s Address" || label === 'My Address for ' ? undefined : label,
    address,
    isMine,
  };
}

/**
 * Validate Address Book
 * =============================================================================
 */
function validateAddressBook(addressBook) {
  if (!addressBook || typeof addressBook !== 'object') {
    console.error('Invalid AddressBook: ', addressBook);
    return {};
  }

  const validAddressBook = Object.entries(addressBook)
    .map(validateEntry)
    .filter(e => e)
    .reduce((obj, contact) => ({ ...obj, [contact.name]: contact }), {});

  return validAddressBook;
}

function validateEntry([entryName, contact]) {
  if (!entryName || typeof entryName !== 'string' || !entryName.trim()) {
    console.error('Invalid AddressBook entry name: ', entryName);
    return;
  }
  if (!contact || typeof contact !== 'object') {
    console.error('Invalid AddressBook contact: ', contact);
    return;
  }

  let { name, addresses, email, phoneNumber, timeZone, notes } = contact;
  if (name !== entryName) {
    console.error('AddressBook name mismatch: ', name, entryName);
    return;
  }
  if (!addresses || !Array.isArray(addresses) || addresses.length === 0) {
    console.error('Invalid AddressBook addresses: ', addresses);
    return;
  }
  const validAddresses = addresses.map(validateAddressInfo).filter(a => a);
  if (validAddresses.length === 0) {
    return;
  }

  const validContact = { name, addresses: validAddresses };
  if (email) {
    if (typeof email !== 'string' || !emailRegex.test(email)) {
      console.error('Invalid email: ', email);
    } else {
      validContact.email = email;
    }
  }

  if (phoneNumber) {
    if (typeof phoneNumber !== 'string') {
      console.error('Invalid phone number: ', phoneNumber);
    } else {
      validContact.phoneNumber = phoneNumber;
    }
  }

  if (timeZone) {
    if (typeof timeZone !== 'string' || !Number.isNaN(parseInt(timeZone))) {
      console.error('Invalid time zone: ', timeZone);
    } else {
      validContact.timeZone = timeZone;
    }
  }

  if (notes) {
    if (typeof notes !== 'string') {
      console.error('Invalid notes: ', notes);
    } else {
      validContact.notes = notes;
    }
  }

  return validContact;
}

function validateAddressInfo(addressInfo) {
  if (!addressInfo || typeof addressInfo !== 'object') {
    console.error('Invalid address info: ', addressInfo);
    return;
  }

  const { address, label, isMine } = addressInfo;
  if (!address || typeof address !== 'string' || !address.trim()) {
    console.error('Invalid address: ', address);
    return;
  }

  const validAddressInfo = { address, isMine: !!isMine };
  if (label) {
    if (typeof label !== 'string') {
      console.error('Invalid label: ', label);
    } else {
      validAddressInfo.label = label;
    }
  }

  return validAddressInfo;
}

/**
 * Public API
 * =============================================================================
 */
export function LoadAddressBook() {
  if (config.Exists(fileName)) {
    const json = config.ReadJson(fileName);
    // `addressbook` (all lowercase) signals the old schema
    // New schema uses camel case `addressBook`
    if (json.addressbook) {
      return validateAddressBook(convertOldAddressBook(json.addressbook));
    } else {
      return validateAddressBook(json.addressBook);
    }
  } else {
    config.WriteJson(fileName, {
      addressBook: {},
    });
    return {};
  }
}

export function SaveAddressBook(addressBook) {
  config.WriteJson(fileName, { addressBook });
}
