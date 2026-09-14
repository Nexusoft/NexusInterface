import { z } from 'zod';
import { atom } from 'jotai';
import { store, subscribe } from 'lib/store';
import { emailRegex } from 'consts/misc';

const contactSchema = z.object({
  name: z.string(),
  addresses: z.array(
    z.object({
      address: z.string(),
      isMine: z.boolean(),
      label: z.string().optional(),
    })
  ),
  genesis: z.string().optional(),
  email: z.string().regex(emailRegex).optional(),
  phoneNumber: z.string().optional(),
  timeZone: z.number().int().min(-720).max(840).optional(),
  notes: z.string().optional(),
});

const addressBookSchema = z.record(contactSchema);

export type Contact = z.infer<typeof contactSchema>;
export type AddressBook = z.infer<typeof addressBookSchema>;

function loadAddressBook() {
  // TODO: deprecate genesis usage in address fields
  const addressBook = window.nexusElectron.settings.getInitial().addressBook;
  try {
    return addressBookSchema.parse(addressBook);
  } catch (error) {
    console.error('Address Book validation error: ', error);
    return {} as AddressBook;
  }
}

const compareNames = (a: Contact, b: Contact) => {
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

const initialAddressBook = loadAddressBook();
export const addressBookAtom = atom<AddressBook>(initialAddressBook);
export const contactsAtom = atom((get) => {
  const addressBook = get(addressBookAtom);
  return addressBook && Object.values(get(addressBookAtom)).sort(compareNames);
});
export const searchQueryAtom = atom('');
export const selectedContactNameAtom = atom<string | null>(null);

let timerId: ReturnType<typeof setTimeout> | undefined;
subscribe(addressBookAtom, (addressBook) => {
  clearTimeout(timerId);
  timerId = setTimeout(() => {
    window.nexusElectron.settings.saveAddressBook(addressBook).catch(console.error);
  }, 0);
});

export const lookupAddress = (address?: string) => {
  const addressBook = store.get(addressBookAtom);
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
  return undefined;
};

export const addNewContact = (contact: Contact) => {
  const addressBook = store.get(addressBookAtom);
  const updatedAddressBook = { ...addressBook, [contact?.name]: contact };
  store.set(addressBookAtom, updatedAddressBook);
};

export const updateContact = (oldName: string, contact: Contact) => {
  const addressBook = store.get(addressBookAtom);
  const updatedAddressBook = { ...addressBook, [contact.name]: contact };
  if (oldName !== contact.name) {
    delete updatedAddressBook[oldName];
    if (store.get(selectedContactNameAtom) === oldName) {
      store.set(selectedContactNameAtom, contact.name);
    }
  }
  store.set(addressBookAtom, updatedAddressBook);
};

export const deleteContact = (name: string) => {
  const updatedAddressBook = { ...store.get(addressBookAtom) };
  delete updatedAddressBook[name];
  store.set(addressBookAtom, updatedAddressBook);
};
