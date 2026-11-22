import { modalSurface } from 'utils/modalStyles';
import styled from '@emotion/styled';
import { useSelector } from 'react-redux';

import Form from 'components/Form';
import ControlledModal from 'components/ControlledModal';
import FormField from 'components/FormField';
import Button from 'components/Button';
import NewUserModal from 'components/NewUserModal';
import RecoverPasswordPinModal from 'components/RecoverPasswordPinModal';
import Spinner from 'components/Spinner';
import { showNotification, openModal } from 'lib/ui';
import { openErrorDialog } from 'lib/dialog';
import { formSubmit, required } from 'lib/form';
import { logIn } from 'lib/session';
import { callAPI } from 'lib/api';
import { fade } from 'utils/color';
import themeStyles from 'utils/themeStyles';
import { useTheme } from '@emotion/react';

__ = __context('Login');

const LoginDialog = styled(ControlledModal)(({ theme }) => ({
  width: 'calc(100% - 32px)',
  maxHeight: 'calc(100% - 32px)',
  ...modalSurface(theme),
}));

const LoginHeader = styled(ControlledModal.Header)({
  margin: 0,
  padding: '28px 28px 12px',
  border: 0,
  textAlign: 'left',
  fontSize: 26,
  fontWeight: 600,
  letterSpacing: '-0.5px',
});

const LoginBody = styled(ControlledModal.Body)(({ theme }) => ({
  margin: '12px 0 28px',
  padding: '0 28px',
  'label': { marginBottom: 8, fontSize: 12, letterSpacing: '0.2px', color: theme.mixer(0.7) },
  '.login-field': { height: 46, borderRadius: 10, fontSize: 14 },
}));

const Buttons = styled.div(themeStyles([{
  marginTop: '2em'
}], [({
  theme
}) => ({
  marginTop: 26,
  'button': {
    minHeight: 46,
    borderRadius: 10,
    background: theme.primary,
    color: theme.primaryAccent,
    border: `1px solid ${theme.primary}`,
    fontWeight: 600,
    '&:hover': {
      background: theme.raise(theme.primary, 0.15),
      color: theme.primaryAccent
    }
  }
})]));

const ExtraSection = styled.div(themeStyles([{
  marginTop: '2em',
  display: 'flex',
  justifyContent: 'space-between',
  opacity: 0.9
}], [{
  marginTop: 22,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: 12,
  fontSize: 12
}]));

const LoginAction = styled.button(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 40,
  padding: '9px 12px',
  border: '1px solid transparent',
  borderRadius: 8,
  background: 'transparent',
  color: theme.mixer(0.8),
  fontFamily: 'inherit',
  fontSize: 13,
  fontWeight: 500,
  lineHeight: 1.4,
  cursor: 'pointer',
  transition: 'background-color 150ms ease, border-color 150ms ease, color 150ms ease',
  '&:hover': {
    background: fade(theme.foreground, 0.94),
    color: theme.foreground,
  },
  '&:focus-visible': {
    outline: `2px solid ${theme.primary}`,
    outlineOffset: 3,
  },
  '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
}));

const initialValues = {
  username: '',
  password: '',
  pin: '',
};

export default function LoginModal() {
  const { modern } = useTheme();
  const syncing = useSelector((state) => state.core.systemInfo?.synchronizing);

  return (
    modern ? (<LoginDialog maxWidth={460}>
      {(closeModal) => (
        <>
          <LoginHeader>{__('Log in')}</LoginHeader>
          <LoginBody>
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
                onSuccess: async (result, { username }) => {
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
                  skin="filled-inverted"
                  className="login-field"
                  validate={required()}
                  placeholder={__('Enter your username')}
                  autoFocus
                />
              </FormField>

              <FormField connectLabel label={__('Password')}>
                <Form.TextFieldWithKeyboard
                  name="password"
                  skin="filled-inverted"
                  className="login-field"
                  validate={required()}
                  maskable
                  placeholder={__('Enter your password')}
                />
              </FormField>

              <FormField connectLabel label={__('PIN')}>
                <Form.TextFieldWithKeyboard
                  name="pin"
                  skin="filled-inverted"
                  className="login-field"
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
                <LoginAction
                  type="button"
                  onClick={() => {
                    closeModal();
                    openModal(RecoverPasswordPinModal);
                  }}
                >
                  {__('Forgot password?')}
                </LoginAction>
                <LoginAction
                  type="button"
                  onClick={() => {
                    closeModal();
                    openModal(NewUserModal);
                  }}
                >
                  {__('Create new user')}
                </LoginAction>
              </ExtraSection>
            </Form>
          </LoginBody>
        </>
      )}
    </LoginDialog>) : (<ControlledModal maxWidth={500}>
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
                onSuccess: async (result, { username }) => {
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
    </ControlledModal>)
  );
}
