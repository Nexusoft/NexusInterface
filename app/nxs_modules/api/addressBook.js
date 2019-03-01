import Ajv from 'ajv';
import config from 'api/configuration';
import { emailRegex } from 'utils/form';

const fileName = 'addressbook.json';

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
        info => info && convertOldAddressInfo({ ...info, isMine: false })
      ),
      ...(mine || []).map(
        info => info && convertOldAddressInfo({ ...info, isMine: true })
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

/**
 * Public API
 * =============================================================================
 */
export function LoadAddressBook() {
  const schema = {
    patternProperties: {
      '^.+$': {
        required: ['name', 'addresses'],
        properties: {
          name: { type: 'string' },
          addresses: {
            type: 'array',
            items: {
              required: ['address', 'isMine'],
              properties: {
                address: {
                  type: 'string',
                  minLength: 51,
                  maxLength: 51,
                },
                isMine: { type: 'boolean' },
                label: { type: 'string' },
              },
            },
          },
          email: {
            type: 'string',
            // also accept empty strings
            pattern: `${emailRegex.source}|^$`,
          },
          phoneNumber: { type: 'string' },
          timeZone: {
            type: 'number',
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

  if (config.Exists(fileName)) {
    const json = config.ReadJson(fileName);
    let addressBook, valid;
    // `addressbook` (all lowercase) signals the old schema
    // New schema uses camel case `addressBook`
    if (json && json.addressbook) {
      addressBook = convertOldAddressBook(json.addressbook);
      valid = validate(addressBook);
      if (valid) SaveAddressBook(addressBook);
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
    config.WriteJson(fileName, {
      addressBook: {},
    });
    return {};
  }
}

export function SaveAddressBook(addressBook) {
  config.WriteJson(fileName, { addressBook });
}
