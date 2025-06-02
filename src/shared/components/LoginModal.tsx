import styled from '@emotion/styled';

import Form from 'components/Form';
import ControlledModal from 'components/ControlledModal';
import FormField from 'components/FormField';
import Button from 'components/Button';
import NewUserModal from 'components/NewUserModal';
import RecoverPasswordPinModal from 'components/RecoverPasswordPinModal';
import Spinner from 'components/Spinner';
import { useCoreInfo } from 'lib/coreInfo';
import { showNotification, openModal } from 'lib/ui';
import { openErrorDialog } from 'lib/dialog';
import { formSubmit, required } from 'lib/form';
import { logIn } from 'lib/session';
import { callAPI } from 'lib/api';

__ = __context('Login');

interface LoginFormValues {
  username: string;
  password: string;
  pin: string;
}

const Buttons = styled.div({
  marginTop: '2em',
});

const ExtraSection = styled.div({
  marginTop: '2em',
  display: 'flex',
  justifyContent: 'space-between',
  opacity: 0.9,
});

const initialValues: LoginFormValues = {
  username: '',
  password: '',
  pin: '',
};

export default function LoginModal() {
  const coreInfo = useCoreInfo();
  const syncing = coreInfo?.syncing;

  return (
    <ControlledModal maxWidth={500}>
      {(closeModal) => (
        <>
          <ControlledModal.Header>{__('Log in')}</ControlledModal.Header>
          <ControlledModal.Body>
            <Form
              name="login"
              initialValues={initialValues}
              onSubmit={formSubmit({
                submit: async ({ username, password, pin }) => {
                  try {
                    return await logIn({ username, password, pin });
                  } catch (err) {
                    let result;
                    try {
                      // In case the sigchain hasn't had a crypto object register initialized
                      const { crypto } = await callAPI(
                        'profiles/status/master',
                        { username }
                      );
                      if (!crypto) {
                        result = await callAPI('profiles/create/auth', {
                          username,
                          password,
                          pin,
                        });
                      }
                    } catch (err2) {
                      throw err;
                    }
                    if (result?.success) {
                      return await logIn({ username, password, pin });
                    } else {
                      throw err;
                    }
                  }
                },
                onSuccess: async ({ username }) => {
                  closeModal();
                  showNotification(
                    __('Logged in as %{username}', { username }),
                    'success'
                  );
                },
                onFail: (err) => {
                  const message =
                    syncing &&
                    // Error code -130: Account doesn't exist or connection failed.
                    (err?.code === -130 ||
                      // Error code -139: Invalid credentials
                      err?.code === -139)
                      ? `${err?.message}. ${__(
                          'Not being fully synced may have caused this error. Please wait for synchronization to complete and try again.'
                        )}`
                      : err?.message;
                  openErrorDialog({
                    message: __('Error logging in'),
                    note: message,
                  });
                },
              })}
            >
              <FormField
                connectLabel
                label={__('Username')}
                style={{ marginTop: 0 }}
              >
                <Form.TextFieldWithKeyboard
                  name="username"
                  validate={required()}
                  placeholder={__('Enter your username')}
                  autoFocus
                />
              </FormField>

              <FormField connectLabel label={__('Password')}>
                <Form.TextFieldWithKeyboard
                  name="password"
                  validate={required()}
                  maskable
                  placeholder={__('Enter your password')}
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

              <Buttons>
                <Form.SubmitButton wide uppercase skin="primary">
                  {({ submitting }) =>
                    submitting ? (
                      <span>
                        <Spinner className="mr0_4" />
                        <span className="v-align">{__('Logging in')}...</span>
                      </span>
                    ) : (
                      __('Log in')
                    )
                  }
                </Form.SubmitButton>
              </Buttons>

              <ExtraSection>
                <Button
                  skin="hyperlink"
                  onClick={() => {
                    closeModal();
                    openModal(RecoverPasswordPinModal);
                  }}
                >
                  {__('Forgot password?')}
                </Button>
                <Button
                  skin="hyperlink"
                  onClick={() => {
                    closeModal();
                    openModal(NewUserModal);
                  }}
                >
                  {__('Create new user')}
                </Button>
              </ExtraSection>
            </Form>
          </ControlledModal.Body>
        </>
      )}
    </ControlledModal>
  );
}
