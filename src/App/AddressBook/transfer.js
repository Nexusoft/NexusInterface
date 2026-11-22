import Ajv from 'ajv';
import { emailRegex } from 'consts/misc';

const validate = new Ajv().compile({
  type: 'object', required: ['addressBook'], additionalProperties: false,
  properties: { addressBook: { type: 'object', additionalProperties: {
    type: 'object', required: ['name', 'addresses'], additionalProperties: false,
    properties: {
      name: { type: 'string', minLength: 1 },
      addresses: { type: 'array', items: {
        type: 'object', required: ['address', 'isMine'], additionalProperties: false,
        properties: { address: { type: 'string', pattern: '^[a-zA-Z0-9]{51,64}$' }, isMine: { type: 'boolean' }, label: { type: 'string' } },
      } },
      genesis: { type: 'string' }, email: { type: 'string', pattern: `${emailRegex.source}|^$` }, phoneNumber: { type: 'string' },
      timeZone: { type: ['integer', 'null'], minimum: -720, maximum: 840 }, notes: { type: 'string' },
    },
  } } },
});

export function parseContactImport(text, existing) {
  const data = JSON.parse(text);
  if (!validate(data)) throw new Error('Choose a valid Nexus address book JSON export.');
  const names = new Set(Object.keys(existing));
  const contacts = [];
  let skipped = 0;
  for (const contact of Object.values(data.addressBook)) {
    if (!contact.name.trim() || ['__proto__', 'constructor', 'prototype'].includes(contact.name)) {
      throw new Error('The file contains an invalid contact name.');
    }
    if (names.has(contact.name)) { skipped += 1; continue; }
    names.add(contact.name);
    contacts.push(contact);
  }
  return { contacts, skipped };
}

export function exportContacts(addressBook) {
  const url = URL.createObjectURL(new Blob([JSON.stringify({ addressBook }, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'nexus-addressbook.json';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
