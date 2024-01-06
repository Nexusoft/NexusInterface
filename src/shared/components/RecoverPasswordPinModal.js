import Form from 'components/Form';
import ControlledModal from 'components/ControlledModal';
import FormField from 'components/FormField';
import LoginModal from 'components/LoginModal';
import Spinner from 'components/Spinner';
import { formSubmit, checkAll, required, minChars } from 'lib/form';
import { callApi } from 'lib/api';
import { openModal } from 'lib/ui';
import { openSuccessDialog, confirmPasswordPin } from 'lib/dialog';
import UT from 'lib/usageTracking';

__ = __context('RecoverPassword&PIN');

const initialValues = {
  username: '',
  recoveryPhrase: '',
  newPassword: '',
  newPin: '',
};

export default function RecoverPasswordPinModal() {
  return (
    <ControlledModal maxWidth={500}>
      {(closeModal) => (
        <>
          <ControlledModal.Header>
            {__('Recover password and PIN')}
          </ControlledModal.Header>
          <ControlledModal.Body>
            <Form
              name="recover-password"
              initialValues={initialValues}
              onSubmit={formSubmit({
                submit: async ({
                  username,
                  recoveryPhrase,
                  newPassword,
                  newPin,
                }) => {
                  const correct = await confirmPasswordPin({
                    isNew: true,
                    password: newPassword,
                    pin: newPin,
                  });

                  if (correct) {
                    return await callApi('profiles/recover/master', {
                      username,
                      recovery: recoveryPhrase,
                      password: newPassword,
                      pin: newPin,
                    });
                  } else {
                    return null;
                  }
                },
                onSuccess: async (result) => {
                  if (!result) return;
                  closeModal();
                  UT.RecoveredUserAccount();
                  openSuccessDialog({
                    message: __('Password & PIN have been updated'),
                    onClose: () => {
                      openModal(LoginModal);
                    },
                  });
                },
                errorMessage: __('Error updating password & PIN'),
              })}
            >
              <FormField label={__('Username')}>
                <Form.TextFieldWithKeyboard
                  name="username"
                  placeholder={__('Your username')}
                  autoFocus
                  validate={required()}
                />
              </FormField>

              <FormField label={__('Recovery phrase')}>
                <Form.TextField
                  multiline
                  rows={1}
                  name="recoveryPhrase"
                  placeholder={__('Your recovery phrase')}
                  validate={required()}
                />
              </FormField>

              <div className="mt2">
                <FormField connectLabel label={__('New Password')}>
                  <Form.TextFieldWithKeyboard
                    maskable
                    name="newPassword"
                    placeholder={__('Enter your new password')}
                    validate={checkAll(required(), minChars(8))}
                  />
                </FormField>

                <FormField connectLabel label={__('New PIN')}>
                  <Form.TextFieldWithKeyboard
                    maskable
                    name="newPin"
                    placeholder={__('Enter your new PIN')}
                    validate={checkAll(required(), minChars(4))}
                  />
                </FormField>
              </div>

              <div className="mt2">
                <Form.SubmitButton skin="primary" wide>
                  {({ submitting }) =>
                    submitting ? (
                      <span>
                        <Spinner className="mr0_4" />
                        <span className="v-align">
                          {__('Recovering password & PIN')}...
                        </span>
                      </span>
                    ) : (
                      __('Recover password & PIN')
                    )
                  }
                </Form.SubmitButton>
              </div>
            </Form>
          </ControlledModal.Body>
        </>
      )}
    </ControlledModal>
  );
}
