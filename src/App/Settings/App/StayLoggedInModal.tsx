import Form from 'components/Form';
import ControlledModal from 'components/ControlledModal';
import FormField from 'components/FormField';
import Spinner from 'components/Spinner';
import { formSubmit, required } from 'lib/form';
import { callAPI } from 'lib/api';
import { rememberLogin } from 'lib/savedLogin';
import { updateSettings } from 'lib/settings';
import { showNotification } from 'lib/ui';

__ = __context('Settings.Application');

const initialValues = {
  password: '',
  pin: '',
};

export default function StayLoggedInModal({ username }: { username: string }) {
  return (
    <ControlledModal maxWidth={500}>
      {(closeModal) => (
        <>
          <ControlledModal.Header>
            {__('Stay logged in when the core restarts')}
          </ControlledModal.Header>
          <ControlledModal.Body>
            <p>
              {__(
                'Enter your password and PIN once. They are kept encrypted by your operating system, for this computer account only.'
              )}
            </p>
            <Form
              name="stay-logged-in"
              initialValues={initialValues}
              onSubmit={formSubmit({
                submit: async ({ password, pin }) => {
                  //checks the credentials, an active session is kept as it is
                  try {
                    await callAPI('sessions/create/local', {
                      username,
                      password,
                      pin,
                    });
                  } catch (err: any) {
                    if (err?.code === -139) {
                      throw new Error(__('Wrong password or PIN'));
                    }
                    throw err;
                  }
                  await rememberLogin({ username, password, pin });
                  updateSettings({ stayLoggedIn: true });
                },
                onSuccess: () => {
                  closeModal();
                  showNotification(
                    __('You will stay logged in when the core restarts'),
                    'success'
                  );
                },
                errorMessage: __('Could not save the login'),
              })}
            >
              <FormField connectLabel label={__('Password')}>
                <Form.TextFieldWithKeyboard
                  name="password"
                  validate={required()}
                  maskable
                  placeholder={__('Enter your password')}
                  autoFocus
                />
              </FormField>

              <FormField connectLabel label={__('PIN')}>
                <Form.TextFieldWithKeyboard
                  name="pin"
                  validate={required()}
                  maskable
                  placeholder={__('Enter your PIN')}
                />
              </FormField>

              <Form.SubmitButton wide skin="primary" className="mt2">
                {({ submitting }) =>
                  submitting ? (
                    <span>
                      <Spinner className="mr0_4" />
                      <span className="v-align">{__('Checking')}...</span>
                    </span>
                  ) : (
                    __('Save')
                  )
                }
              </Form.SubmitButton>
            </Form>
          </ControlledModal.Body>
        </>
      )}
    </ControlledModal>
  );
}
