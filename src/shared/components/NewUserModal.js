import { modalSurface } from 'utils/modalStyles';
import { useEffect, useRef } from 'react';
import * as React from 'react';
import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';
import { fade, luminosity } from 'utils/color';

import Form from 'components/Form';
import ControlledModal from 'components/ControlledModal';
import FormField from 'components/FormField';
import LoginModal from 'components/LoginModal';
import Spinner from 'components/Spinner';
import FieldSet from 'components/FieldSet';
import BackgroundTask from 'components/BackgroundTask';
import { formSubmit, checkAll, required, minChars } from 'lib/form';
import { callAPI } from 'lib/api';
import {
  showNotification,
  openModal,
  showBackgroundTask,
  isModalOpen,
} from 'lib/ui';
import store, { observeStore } from 'store';
import { isLoggedIn } from 'selectors';
import { confirmPasswordPin } from 'lib/dialog';
import UT from 'lib/usageTracking';

__ = __context('NewUser');

const CreateDialog = styled(ControlledModal)(({ theme }) => theme.modern && ({
  width: 'calc(100% - 32px)', maxHeight: 'calc(100% - 32px)',
  ...modalSurface(theme),
}));

const CreateHeader = styled(ControlledModal.Header)(({ theme }) => theme.modern && ({
  borderBottom: 0, paddingBottom: 0,
  '.brand': { fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 },
  h1: { margin: 0, fontSize: 20, fontWeight: 500, lineHeight: 1.25, color: theme.foreground },
  p: { margin: '10px 0 0', fontSize: 13, fontWeight: 400, letterSpacing: 0, lineHeight: 1.6, color: theme.mixer(0.65) },
}));

const CreateBody = styled(ControlledModal.Body)(({ theme }) => theme.modern && ({
  label: { fontSize: 12, textTransform: 'none', letterSpacing: '0.2px', marginBottom: 8, color: theme.mixer(0.8) },
  '.create-field': { minHeight: 48, borderRadius: 12, fontSize: 14 },
  'button:focus-visible': { outline: `2px solid ${theme.primary}`, outlineOffset: 3 },
}));

const CredentialReminder = styled(FieldSet)(({ theme }) => theme.modern && ({
  margin: '24px 0 0', padding: '12px 16px 16px', borderRadius: 12,
  borderColor: fade(theme.primary, 0.7), background: fade(theme.primary, 0.95),
  fontSize: 12, lineHeight: 1.7, color: theme.mixer(0.8),
  legend: { textAlign: 'left', textTransform: 'none', fontSize: 12, fontWeight: 600, color: theme.primary },
}));

const Buttons = styled.div(({ theme }) => ({
  marginTop: '1.5em',
  ...(theme.modern && {
    marginTop: 24,
    '> button': { minHeight: 48, borderRadius: 12, fontSize: 14, fontWeight: 600,
      '&&, &&:hover, &&:active, &&:disabled': { background: theme.primary, color: luminosity(theme.primary) > 0.179 ? '#000000' : '#ffffff', border: 0, textShadow: 'none' },
    },
  }),
}));

const ExtraSection = styled.div(({ theme }) => ({
  marginTop: '2em',
  display: 'flex',
  justifyContent: 'center',
  opacity: 0.9,
  ...(theme.modern && { marginTop: 22, paddingTop: 20, borderTop: `1px solid ${theme.mixer(0.12)}`, alignItems: 'center', flexWrap: 'wrap', gap: 8, fontSize: 12 }),
}));

const LoginButton = styled.button(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxSizing: 'border-box',
  minHeight: 44,
  minWidth: 88,
  padding: '10px 18px',
  border: `1px solid ${fade(theme.primary, 0.5)}`,
  borderRadius: 10,
  background: fade(theme.primary, 0.94),
  color: theme.primary,
  fontFamily: 'inherit',
  fontSize: 13,
  fontWeight: 600,
  lineHeight: 1.4,
  cursor: 'pointer',
  transition: 'background-color 150ms ease, border-color 150ms ease',
  '&:hover:not(:disabled)': {
    background: fade(theme.primary, 0.86),
    borderColor: theme.primary,
  },
  '&:active:not(:disabled)': { background: fade(theme.primary, 0.8) },
  '&:focus-visible': { outline: `2px solid ${theme.primary}`, outlineOffset: 3 },
  '&:disabled': { opacity: 0.5, cursor: 'not-allowed' },
}));

const Note = styled.div({
  textAlign: 'center',
  opacity: 0.7,
  fontStyle: 'italic',
  fontSize: '.9em',
  marginTop: '.5em',
});

const initialValues = {
  username: '',
  password: '',
  pin: '',
};

export default function NewUserModal() {
  const { modern } = useTheme();
  return (
    <CreateDialog maxWidth={500}>
      {(closeModal) => (
        <>
          <CreateHeader>
            {modern ? <><div className="brand">Nexus Wallet</div><h1>{__('Create new user')}</h1><p>{__('Choose your credentials to get started.')}</p></> : __('Create new user')}
          </CreateHeader>
          <CreateBody>
            <Form
              name="new_user"
              initialValues={initialValues}
              onSubmit={formSubmit({
                submit: async ({ username, password, pin }) => {
                  const correct = await confirmPasswordPin({
                    isNew: false,
                    password,
                    pin,
                  });

                  if (correct) {
                    return await callAPI('profiles/create/master', {
                      username,
                      password,
                      pin,
                    });
                  } else {
                    return null;
                  }
                },
                onSuccess: async (result, { username }, form) => {
                  if (!result) return;
                  UT.CreateUserAccount();
                  closeModal();
                  form.restart();
                  showBackgroundTask(UserConfirmBackgroundTask, {
                    username,
                  });
                },
                errorMessage: __('Error creating user'),
              })}
              subscription={{ submitting: true }}
            >
              {({ submitting }) => (
                <>
                  <FormField
                    connectLabel
                    label={__('Username')}
                    style={{ marginTop: 0 }}
                  >
                    <Form.TextFieldWithKeyboard
                      name="username"
                      skin={modern ? 'filled-inverted' : undefined}
                      className="create-field"
                      placeholder={__('A globally unique username')}
                      autoFocus
                      validate={checkAll(required(), minChars(3))}
                    />
                  </FormField>

                  <FormField connectLabel label={__('Password')}>
                    <Form.TextFieldWithKeyboard
                      maskable
                      name="password"
                      skin={modern ? 'filled-inverted' : undefined}
                      className="create-field"
                      placeholder={__('Enter your password')}
                      validate={checkAll(required(), minChars(8))}
                    />
                  </FormField>

                  <FormField connectLabel label={__('PIN')}>
                    <Form.TextFieldWithKeyboard
                      maskable
                      name="pin"
                      skin={modern ? 'filled-inverted' : undefined}
                      className="create-field"
                      placeholder={__('Enter your PIN')}
                      validate={checkAll(required(), minChars(4))}
                    />
                  </FormField>

                  <CredentialReminder
                    legend={modern ? __('Keep your credentials safe') : __('Attention')}
                    style={modern ? undefined : { fontSize: '.9em' }}
                  >
                    {__(
                      'Please be sure to make a note of your username, password, and PIN, and keep it in a safe place. If you lose or forget them you will be unable to access your account.'
                    )}
                  </CredentialReminder>

                  <Buttons>
                    <Form.SubmitButton wide uppercase={!modern} skin={modern ? 'filled-primary' : 'primary'}>
                      {({ submitting }) =>
                        submitting ? (
                          <span>
                            <Spinner className="mr0_4" />
                            <span className="v-align">
                              {__('Creating user')}...
                            </span>
                          </span>
                        ) : (
                          __('Create user')
                        )
                      }
                    </Form.SubmitButton>
                  </Buttons>
                  {submitting && (
                    <Note>
                      {__('Please wait, this may take up to 30 seconds')}
                    </Note>
                  )}

                  <ExtraSection>
                    {modern && <span>{__('Already have an account?')}</span>}
                    <LoginButton
                      type="button"
                      disabled={submitting}
                      onClick={() => {
                        closeModal();
                        openModal(LoginModal);
                      }}
                    >
                      {__('Log in')}
                    </LoginButton>
                  </ExtraSection>
                </>
              )}
            </Form>
          </CreateBody>
        </>
      )}
    </CreateDialog>
  );
}

function UserConfirmBackgroundTask({ username }) {
  const closeTaskRef = useRef();
  useEffect(
    () =>
      observeStore(
        ({ core: { systemInfo } }) => systemInfo?.blocks,
        async () => {
          const result = await callAPI('profiles/status/master', {
            username,
          });
          if (result?.confirmed) {
            closeTaskRef.current?.();
            showNotification(
              __(
                'User <b>%{username}</b> has been successfully registered',
                {
                  username,
                },
                {
                  b: (text) => (
                    <span>
                      &nbsp;<strong>{text}</strong>&nbsp;
                    </span>
                  ),
                }
              ),
              'success'
            );
            if (!isLoggedIn(store.getState()) && !isModalOpen(LoginModal)) {
              openModal(LoginModal);
            }
          }
        }
      ),
    []
  );

  return (
    <BackgroundTask
      assignClose={(close) => (closeTaskRef.current = close)}
      onClick={null}
      style={{ cursor: 'default' }}
    >
      {__(
        'Waiting for user registration to be confirmed on Nexus blockchain...'
      )}
    </BackgroundTask>
  );
}
