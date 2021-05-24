import * as TYPE from 'consts/actionTypes';
import store from 'store';
import fs from 'fs';
import path from 'path';
import Ajv from 'ajv';
import { walletDataDir } from 'consts/paths';
import { emailRegex } from 'consts/misc';
import { readJson, writeJson } from 'utils/json';

const fileName = 'addressbook.json';
const filePath = path.join(walletDataDir, fileName);

/**
 * Convert the old addressbook.json schema
 * =============================================================================
 */

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

/**
 * Public API
 * =============================================================================
 */

export const loadAddressBook = loadAddressBookFromFile;

export const lookupAddress = (address) => {
  const { addressBook } = store.getState();
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
  const result = store.dispatch({
    type: TYPE.ADD_NEW_CONTACT,
    payload: contact,
  });
  const { addressBook } = store.getState();
  saveAddressBookToFile(addressBook);
  return result;
};

export const updateContact = (name, contact) => {
  const result = store.dispatch({
    type: TYPE.UPDATE_CONTACT,
    payload: { name, contact },
  });
  const { addressBook } = store.getState();
  saveAddressBookToFile(addressBook);
  return result;
};

export const deleteContact = (name) => {
  const result = store.dispatch({
    type: TYPE.DELETE_CONTACT,
    payload: name,
  });
  const { addressBook } = store.getState();
  saveAddressBookToFile(addressBook);
  return result;
};

export const searchContact = (query) => {
  store.dispatch({
    type: TYPE.CONTACT_SEARCH,
    payload: query,
  });
};

export const selectContact = (index) => {
  store.dispatch({
    type: TYPE.SELECT_CONTACT,
    payload: index,
  });
};
