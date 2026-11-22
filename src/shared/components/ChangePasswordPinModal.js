import Form from 'components/Form';
import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';
import Button from 'components/Button';
import { fade } from 'utils/color';
import ControlledModal from 'components/ControlledModal';
import FormField from 'components/FormField';
import Spinner from 'components/Spinner';
import { formSubmit, checkAll, required, minChars } from 'lib/form';
import { callAPI } from 'lib/api';
import { openSuccessDialog, confirmPasswordPin } from 'lib/dialog';
import UT from 'lib/usageTracking';

__ = __context('ChangePassword&PIN');

const initialValues = {
  password: '',
  pin: '',
  newPassword: '',
  newPin: '',
};

const CredentialGroup = styled.div(({ theme }) => theme.modern ? {
  padding: '16px 18px', marginBottom: 16, borderRadius: 12,
  border: `1px solid ${fade(theme.primary, 0.8)}`, background: fade(theme.primary, 0.97),
  '> h3': { margin: '0 0 14px', color: theme.primary, fontSize: 12, fontWeight: 600 },
  '> div': { marginTop: 14 },
  'label': { fontSize: 12, textTransform: 'none', marginBottom: 8, color: theme.mixer(0.75) },
  'input': { minWidth: 0, fontSize: 13 },
  '.credential-input': { borderRadius: 8, minHeight: 40 },
  '@media (max-width: 500px)': { padding: 14 },
} : {});

const Actions = styled.div(({ theme }) => theme.modern ? {
  display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20, flexWrap: 'wrap',
  'button': { height: 34, borderRadius: 8, padding: '0 16px', fontSize: 12 },
} : { marginTop: '2em' });

export default function ChangePasswordPinModal() {
  const { modern } = useTheme();
  return (
    <ControlledModal maxWidth={500}>
      {(closeModal) => (
        <>
          <ControlledModal.Header>
            {__('Change password and PIN')}
          </ControlledModal.Header>
          <ControlledModal.Body>
            <Form
              name="change-password"
              initialValues={initialValues}
              onSubmit={formSubmit({
                submit: async ({ password, pin, newPassword, newPin }) => {
                  const correct = await confirmPasswordPin({
                    isNew: true,
                    password: newPassword,
                    pin: newPin,
                  });

                  if (correct) {
                    return await callAPI('profiles/update/credentials', {
                      password,
                      pin,
                      new_password: newPassword,
                      new_pin: newPin,
                    });
                  }
                },
                onSuccess: async (result, values, form) => {
                  if (!result) return;
                  UT.UpdateCredentials();
                  closeModal();
                  form.restart();
                  openSuccessDialog({
                    message: __('Password & PIN have been updated'),
                  });
                },
                errorMessage: __('Error updating password & PIN'),
              })}
            >
              <CredentialGroup>
              {modern && <h3>{__('Current credentials')}</h3>}
              <FormField connectLabel label={__('Current password')}>
                <Form.TextFieldWithKeyboard
                  className="credential-input"
                  skin={modern ? 'filled-inverted' : 'underline'}
                  name="password"
                  maskable
                  placeholder={__('Your current password')}
                  autoFocus
                  validate={required()}
                />
              </FormField>

              <FormField connectLabel label={__('Current PIN')}>
                <Form.TextFieldWithKeyboard
                  className="credential-input"
                  skin={modern ? 'filled-inverted' : 'underline'}
                  name="pin"
                  maskable
                  placeholder={__('Your current PIN')}
                  validate={required()}
                />
              </FormField>
              </CredentialGroup>

              <CredentialGroup className={modern ? undefined : 'mt2'}>
                {modern && <h3>{__('New credentials')}</h3>}
                <FormField connectLabel label={__('New Password')}>
                  <Form.TextFieldWithKeyboard
                    className="credential-input"
                    skin={modern ? 'filled-inverted' : 'underline'}
                    maskable
                    name="newPassword"
                    placeholder={__('Enter your new password')}
                    validate={checkAll(required(), minChars(8))}
                  />
                </FormField>

                <FormField connectLabel label={__('New PIN')}>
                  <Form.TextFieldWithKeyboard
                    className="credential-input"
                    skin={modern ? 'filled-inverted' : 'underline'}
                    maskable
                    name="newPin"
                    placeholder={__('Enter your new PIN')}
                    validate={checkAll(required(), minChars(4))}
                  />
                </FormField>
              </CredentialGroup>

              <Actions>
                {modern && <Button type="button" onClick={closeModal}>{__('Cancel')}</Button>}
                <Form.SubmitButton skin={modern ? 'filled-primary' : 'primary'} wide={!modern}>
                  {({ submitting }) =>
                    submitting ? (
                      <span>
                        <Spinner className="mr0_4" />
                        <span className="v-align">{__('Updating')}...</span>
                      </span>
                    ) : (
                      __('Update')
                    )
                  }
                </Form.SubmitButton>
              </Actions>
            </Form>
          </ControlledModal.Body>
        </>
      )}
    </ControlledModal>
  );
}
