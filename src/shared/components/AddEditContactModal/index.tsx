// External
import { useRef, useEffect } from 'react';
import { FORM_ERROR } from 'final-form';
import arrayMutators from 'final-form-arrays';
import { useAtomValue } from 'jotai';

// Internal
import ControlledModal from 'components/ControlledModal';
import Form from 'components/Form';
import FormField from 'components/FormField';
import Button from 'components/Button';
import {
  addNewContact,
  updateContact,
  addressBookAtom,
  Contact,
} from 'lib/addressBook';
import { showNotification } from 'lib/ui';
import { formSubmit, required, checkAll } from 'lib/form';
import { emailRegex } from 'consts/misc';
import timeZones from 'data/timeZones';
import Addresses from './Addresses';
import UT from 'lib/usageTracking';

__ = __context('AddEditContact');

interface FormValues {
  name: string;
  notMine: {
    address: string;
    label: string;
  }[];
  mine: {
    address: string;
    label: string;
  }[];
  genesis: string;
  email: string;
  phoneNumber: string;
  timeZone: number | undefined;
  notes: string;
}

const initialContact: Partial<FormValues> = {
  name: '',
  notMine: [
    {
      address: '',
      label: '',
    },
  ],
  mine: [],
  genesis: '',
  email: '',
  phoneNumber: '',
  timeZone: undefined,
  notes: '',
};

const tzOptions = timeZones.map((tz) => ({
  value: tz.value,
  display: `(${tz.offset}) ${tz.description}`,
}));

function getInitialValues(contact: Contact) {
  const mine = contact.addresses.filter((c) => c.isMine);
  const notMine = contact.addresses.filter((c) => !c.isMine);
  return { ...contact, mine, notMine } as Partial<FormValues>;
}

const validateGenesis = (value?: string) =>
  value?.length !== 64 ? __('Invalid user ID') : undefined;

const validateEmail = (value?: string) =>
  value && !emailRegex.test(value.toLowerCase())
    ? __('Invalid email')
    : undefined;

export default function AddEditContactModal({
  edit,
  contact,
}:
  | {
      edit?: false;
      contact?: undefined;
    }
  | {
      edit: true;
      contact: Contact;
    }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const addressBook = useAtomValue(addressBookAtom);
  const oldName = contact?.name;

  useEffect(() => {
    // Not sure why but calling focus directly doesn't work
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  }, []);

  const nameUnique = (value: string) =>
    addressBook?.[value] &&
    (!edit || value !== oldName) &&
    __('A contact with the same name already exists.');

  return (
    <ControlledModal>
      {(closeModal) => (
        <>
          <ControlledModal.Header>
            {edit ? __('Edit contact') : __('Create new contact')}
          </ControlledModal.Header>
          <ControlledModal.Body>
            <Form
              name={edit ? `editContact:${contact.name}` : 'createContact'}
              initialValues={edit ? getInitialValues(contact) : initialContact}
              validate={({ mine, notMine }) => {
                if (!mine?.length && !notMine?.length) {
                  return {
                    [FORM_ERROR]: __('At least one address is required.'),
                  };
                }
                return undefined;
              }}
              onSubmit={formSubmit<FormValues>({
                submit: (values) => {
                  const addresses = [
                    ...values.notMine.map((addr) => ({
                      ...addr,
                      isMine: false,
                    })),
                    ...values.mine.map((addr) => ({ ...addr, isMine: true })),
                  ];
                  const { mine, notMine, ...tempContact } = values;
                  const contact: Contact = { ...tempContact, addresses };

                  if (edit) {
                    updateContact(oldName!, contact);
                  } else {
                    addNewContact(contact);
                  }
                },
                onSuccess: () => {
                  UT.AddAddressBookEntry(!!edit);
                  closeModal();
                  if (edit) {
                    showNotification(__('Contact has been updated'), 'success');
                  } else {
                    showNotification(
                      __('New contact has been added to address book'),
                      'success'
                    );
                  }
                },
              })}
              mutators={{ ...arrayMutators }}
            >
              <FormField connectLabel label={__('Name')}>
                <Form.TextField
                  name="name"
                  validate={checkAll(required(), nameUnique)}
                  placeholder={__('Contact name')}
                  ref={inputRef}
                />
              </FormField>

              <Form.FieldArray
                name="notMine"
                component={Addresses}
                isMine={false}
              />

              <Form.FieldArray
                name="mine"
                component={Addresses}
                isMine={true}
              />

              <Form.Spy
                subscription={{ error: true }}
                render={({ error }) =>
                  !!error && <div className="error mt1">{error}</div>
                }
              />

              <div className="mt2">
                <FormField connectLabel label={__('Nexus user ID')}>
                  <Form.TextField
                    name="genesis"
                    validate={validateGenesis}
                    placeholder={__('Nexus user ID')}
                  />
                </FormField>

                <FormField connectLabel label={__('Email address')}>
                  <Form.TextField
                    name="email"
                    type="email"
                    validate={validateEmail}
                    placeholder={__('Email address')}
                  />
                </FormField>

                <FormField connectLabel label={__('Phone number')}>
                  <Form.TextField
                    name="phoneNumber"
                    placeholder={__('Phone number')}
                  />
                </FormField>

                <FormField connectLabel label={__('Time zone')}>
                  <Form.Select
                    name="timeZone"
                    options={tzOptions}
                    placeholder={__('Select a time zone')}
                  />
                </FormField>

                <FormField connectLabel label={__('Notes')}>
                  <Form.MultilineTextField
                    name="notes"
                    placeholder={__('Notes')}
                    rows={1}
                  />
                </FormField>
              </div>

              <div
                className="mt2 flex space-between"
                style={{ marginBottom: '1em' }}
              >
                <div>
                  <Button onClick={closeModal}>{__('Cancel')}</Button>
                  <Form.Spy
                    subscription={{ pristine: true }}
                    render={({ form, pristine }) => (
                      <Button
                        onClick={form.reset}
                        disabled={pristine}
                        style={{ marginLeft: '1em' }}
                      >
                        {__('Reset')}
                      </Button>
                    )}
                  />
                </div>
                <Form.SubmitButton skin="primary">
                  {edit ? __('Save changes') : __('Create')}
                </Form.SubmitButton>
              </div>
            </Form>
          </ControlledModal.Body>
        </>
      )}
    </ControlledModal>
  );
}
