import fs from 'fs';
import path from 'path';
import Ajv from 'ajv';
import { atom } from 'jotai';
import memoize from 'utils/memoize';
import { jotaiStore, subscribe } from 'store';
import { walletDataDir } from 'consts/paths';
import { emailRegex } from 'consts/misc';
import { readJson, writeJson } from 'utils/json';

const fileName = 'addressbook.json';
const filePath = path.join(walletDataDir, fileName);

function convertOldAddressBook(addressBook) {
  if (!Array.isArray(addressBook)) return [];
  return addressBook.reduce(
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
    addresses: [
      ...(notMine || []).map(
        (info) => info && convertOldAddressInfo({ ...info, isMine: false })
      ),
      ...(mine || []).map(
        (info) => info && convertOldAddressInfo({ ...info, isMine: true })
      ),
    ],
    phoneNumber,
    timeZone: parseInt(timezone),
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

function loadAddressBookFromFile() {
  // TODO: deprecate genesis usage in address fields
  const schema = {
    type: 'object',
    patternProperties: {
      '^.+$': {
        type: 'object',
        required: ['name', 'addresses'],
        properties: {
          name: { type: 'string' },
          addresses: {
            type: 'array',
            items: {
              type: 'object',
              required: ['address', 'isMine'],
              properties: {
                address: {
                  type: 'string',
                  minLength: 51,
                  maxLength: 64,
                },
                isMine: { type: 'boolean' },
                label: { type: 'string' },
              },
            },
          },
          genesis: { type: 'string' },
          email: {
            type: 'string',
            // also accept empty strings
            pattern: `${emailRegex.source}|^$`,
          },
          phoneNumber: { type: 'string' },
          timeZone: {
            type: ['number', 'null'],
            minimum: -720,
            maximum: 840,
            multipleOf: 1,
          },
          notes: { type: 'string' },
        },
      },
    },
  };
  const ajv = new Ajv();
  const validate = ajv.compile(schema);

  if (fs.existsSync(filePath)) {
    const json = readJson(filePath) || {};
    let addressBook, valid;
    // `addressbook` (all lowercase) signals the old schema
    // New schema uses camel case `addressBook`
    if (json && json.addressbook) {
      addressBook = convertOldAddressBook(json.addressbook);
      valid = validate(addressBook);
      if (valid) saveAddressBookToFile(addressBook);
    } else {
      addressBook = json.addressBook;
      valid = validate(addressBook);
    }

    if (valid) {
      return addressBook;
    } else {
      console.error(
        'Address Book validation error: ' + ajv.errorsText(validate.errors)
      );
      return {};
    }
  } else {
    writeJson(filePath, {
      addressBook: {},
    });
    return {};
  }
}

function saveAddressBookToFile(addressBook) {
  return writeJson(filePath, { addressBook });
}

export const lookupAddress = (address) => {
  const addressBook = jotaiStore.get(addressBookAtom);
  for (const contact of Object.values(addressBook)) {
    const match =
      contact.addresses && contact.addresses.find((a) => a.address === address);
    if (match) {
      return {
        name: contact.name,
        label: match.label,
      };
    }
  }
};

export const addNewContact = (contact) => {
  const addressBook = jotaiStore.get(addressBookAtom);
  const updatedAddressBook = { ...addressBook, [contact?.name]: contact };
  jotaiStore.set(addressBookAtom, updatedAddressBook);
};

export const updateContact = (oldName, contact) => {
  const addressBook = jotaiStore.get(addressBookAtom);
  const updatedAddressBook = { ...addressBook, [contact?.name]: contact };
  if (oldName !== contact?.name) {
    delete updatedAddressBook[oldName];
    if (jotaiStore.get(selectedContactNameAtom) === oldName) {
      jotaiStore.set(selectedContactNameAtom, contact?.name);
    }
  }
  jotaiStore.set(addressBookAtom, updatedAddressBook);
};

export const deleteContact = (name) => {
  const updatedAddressBook = { ...jotaiStore.get(addressBookAtom) };
  delete updatedAddressBook[name];
  jotaiStore.set(addressBookAtom, updatedAddressBook);
};

const compareNames = (a, b) => {
  let nameA = a.name.toUpperCase();
  let nameB = b.name.toUpperCase();
  if (nameA < nameB) {
    return -1;
  }
  if (nameA > nameB) {
    return 1;
  }
  return 0;
};

const getContacts = memoize(
  (addressBook) => addressBook && Object.values(addressBook).sort(compareNames)
);

const initialAddressBook = loadAddressBookFromFile();
export const addressBookAtom = atom(initialAddressBook);
export const contactsAtom = atom((get) => getContacts(get(addressBookAtom)));
export const searchQueryAtom = atom('');
export const selectedContactNameAtom = atom(null);

const timerId = null;
subscribe(addressBookAtom, (addressBook) => {
  clearTimeout(timerId);
  setTimeout(() => {
    saveAddressBookToFile(addressBook);
  }, 0);
});
