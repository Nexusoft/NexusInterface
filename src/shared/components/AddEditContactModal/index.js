// External
import { useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import arrayMutators from 'final-form-arrays';
import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';
import { fade } from 'utils/color';

// Internal
import ControlledModal from 'components/ControlledModal';
import Form from 'components/Form';
import FormField from 'components/FormField';
import Button from 'components/Button';
import { addNewContact, updateContact } from 'lib/addressBook';
import { showNotification } from 'lib/ui';
import { formSubmit, required, checkAll } from 'lib/form';
import { emailRegex } from 'consts/misc';
import timeZones from 'data/timeZones';
import Addresses from './Addresses';
import { ContactInput, ContactSelect } from './Fields';
import UT from 'lib/usageTracking';

__ = __context('AddEditContact');

const ContactModal = styled(ControlledModal)({
  '> form': { display: 'contents' },
});

const Section = styled.section(({ theme }) => theme.modern && ({
  padding: 18, marginBottom: 16, minWidth: 0, borderRadius: 14,
  border: `1px solid ${fade(theme.primary, 0.85)}`,
  background: fade(theme.primary, 0.98),
  '> h3': { margin: '0 0 16px', fontSize: 10, fontWeight: 500, letterSpacing: 1.4, textTransform: 'uppercase', color: theme.primary },
  '> div:first-of-type': { marginTop: 0 },
}));

const ContactFields = styled.div(({ theme }) => theme.modern && ({
  display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 18,
  '> div': { minWidth: 0, marginTop: 0 },
  '> div:first-of-type, > div:last-of-type': { gridColumn: '1 / -1' },
  '@media (max-width: 560px)': { gridTemplateColumns: 'minmax(0, 1fr)' },
}));

const Actions = styled.div(({ theme }) => ({
  display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
  '> div': { display: 'flex', gap: 12 },
  ...(theme.modern && { button: { minHeight: 42, height: 'auto', padding: '10px 18px', whiteSpace: 'normal' } }),
}));

const initialContact = {
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
  timeZone: null,
  notes: '',
};

const tzOptions = timeZones.map((tz) => ({
  value: tz.value,
  display: `(${tz.offset}) ${tz.description}`,
}));

function getInitialValues(contact) {
  const mine = contact.addresses.filter((c) => c.isMine);
  const notMine = contact.addresses.filter((c) => !c.isMine);
  return { ...contact, mine, notMine };
}

const validateGenesis = (value) =>
  value && value?.length !== 64 ? __('Invalid user ID') : undefined;

const validateEmail = (value) =>
  value && !emailRegex.test(value.toLowerCase())
    ? __('Invalid email')
    : undefined;

export default function AddEditContactModal({ edit, contact, prefill }) {
  const theme = useTheme();
  const inputSkin = theme.modern ? 'filled-inverted' : 'underline';
  const inputRef = useRef();
  const addressBook = useSelector((state) => state.addressBook);
  const oldName = contact?.name;

  useEffect(() => {
    // Not sure why but calling focus directly doesn't work
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const nameUnique = (value) =>
    addressBook?.[value] &&
    (!edit || value !== oldName) &&
    __('A contact with the same name already exists.');

  return (
    <ContactModal maxWidth={820}>
      {(closeModal) => (
        <>
          <ControlledModal.Header>
            {edit ? __('Edit contact') : __('Create new contact')}
          </ControlledModal.Header>
            <Form
              name={edit ? `editContact:${contact.name}` : 'createContact'}
              initialValues={
                edit
                  ? getInitialValues(contact)
                  : { ...initialContact, ...prefill }
              }
              onSubmit={formSubmit({
                submit: (values) => {
                  const contact = { ...values };
                  const addresses = [
                    ...(contact.notMine || []).map((addr) => ({
                      ...addr,
                      isMine: false,
                    })),
                    ...(contact.mine || []).map((addr) => ({ ...addr, isMine: true })),
                  ].filter((addr) => addr.address?.trim())
                    .map((addr) => ({ ...addr, address: addr.address.trim() }));
                  delete contact.mine;
                  delete contact.notMine;
                  contact.addresses = addresses;

                  if (edit) {
                    updateContact(oldName, contact);
                  } else {
                    addNewContact(contact);
                  }
                },
                onSuccess: (result, dispatch, props) => {
                  UT.AddAddressBookEntry(edit);
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
              <ControlledModal.Body>
              <Section>
              <FormField connectLabel label={theme.modern ? __('Contact name') : __('Name')}>
                <ContactInput
                  skin={inputSkin}
                  name="name"
                  validate={checkAll(required(), nameUnique)}
                  placeholder={__('Contact name')}
                  ref={inputRef}
                />
              </FormField>
              </Section>

              <Section>
              {theme.modern && <h3>{__('Nexus addresses')}</h3>}
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
              </Section>

              <Section>
              {theme.modern && <h3>{__('Contact information')}</h3>}
              <ContactFields>
                <FormField connectLabel label={__('Nexus user ID')}>
                  <ContactInput
                    name="genesis"
                    skin={inputSkin}
                    validate={validateGenesis}
                    placeholder={__('Nexus user ID')}
                  />
                </FormField>

                <FormField connectLabel label={__('Email address')}>
                  <ContactInput
                    name="email"
                    skin={inputSkin}
                    type="email"
                    validate={validateEmail}
                    placeholder={__('Email address')}
                  />
                </FormField>

                <FormField connectLabel label={__('Phone number')}>
                  <ContactInput
                    name="phoneNumber"
                    skin={inputSkin}
                    placeholder={__('Phone number')}
                  />
                </FormField>

                <FormField connectLabel label={__('Time zone')}>
                  <ContactSelect
                    name="timeZone"
                    skin={inputSkin}
                    options={tzOptions}
                    placeholder={__('Select a time zone')}
                  />
                </FormField>

                <FormField connectLabel label={__('Notes')}>
                  <ContactInput
                    name="notes"
                    skin={inputSkin}
                    placeholder={__('Notes')}
                    multiline
                    rows={theme.modern ? 3 : 1}
                  />
                </FormField>
              </ContactFields>
              </Section>
              </ControlledModal.Body>

              <ControlledModal.Footer separator>
              <Actions>
                <div>
                  <Button onClick={closeModal}>{__('Cancel')}</Button>
                  <Form.Spy
                    subscription={{ pristine: true }}
                    render={({ form, pristine }) => (
                      <Button
                        onClick={() => form.reset()}
                        disabled={pristine}
                      >
                        {__('Reset')}
                      </Button>
                    )}
                  />
                </div>
                <Form.SubmitButton skin={theme.modern ? 'filled-primary' : 'primary'}>
                  {edit ? __('Save changes') : __('Create')}
                </Form.SubmitButton>
              </Actions>
              </ControlledModal.Footer>
            </Form>
        </>
      )}
    </ContactModal>
  );
}
