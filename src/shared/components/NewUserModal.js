import { useEffect, useRef } from 'react';
import * as React from 'react';
import styled from '@emotion/styled';

import Form from 'components/Form';
import ControlledModal from 'components/ControlledModal';
import FormField from 'components/FormField';
import Link from 'components/Link';
import LoginModal from 'components/LoginModal';
import Spinner from 'components/Spinner';
import FieldSet from 'components/FieldSet';
import BackgroundTask from 'components/BackgroundTask';
import { formSubmit, checkAll, required, minChars } from 'lib/form';
import { blocksAtom } from 'lib/coreInfo';
import { callAPI } from 'lib/api';
import {
  showNotification,
  openModal,
  showBackgroundTask,
  isModalOpen,
} from 'lib/ui';
import { jotaiStore } from 'store';
import { loggedInAtom } from 'lib/session';
import { confirmPasswordPin } from 'lib/dialog';
import UT from 'lib/usageTracking';

__ = __context('NewUser');

const Buttons = styled.div({
  marginTop: '1.5em',
});

const ExtraSection = styled.div({
  marginTop: '2em',
  display: 'flex',
  justifyContent: 'center',
  opacity: 0.9,
});

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
  return (
    <ControlledModal maxWidth={500}>
      {(closeModal) => (
        <>
          <ControlledModal.Header>
            {__('Create new user')}
          </ControlledModal.Header>
          <ControlledModal.Body>
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
                      placeholder={__('A globally unique username')}
                      autoFocus
                      validate={checkAll(required(), minChars(3))}
                    />
                  </FormField>

                  <FormField connectLabel label={__('Password')}>
                    <Form.TextFieldWithKeyboard
                      maskable
                      name="password"
                      placeholder={__('Enter your password')}
                      validate={checkAll(required(), minChars(8))}
                    />
                  </FormField>

                  <FormField connectLabel label={__('PIN')}>
                    <Form.TextFieldWithKeyboard
                      maskable
                      name="pin"
                      placeholder={__('Enter your PIN')}
                      validate={checkAll(required(), minChars(4))}
                    />
                  </FormField>

                  <FieldSet
                    legend={__('Attention')}
                    style={{ fontSize: '.9em' }}
                  >
                    {__(
                      'Please be sure to make a note of your username, password, and PIN, and keep it in a safe place. If you lose or forget them you will be unable to access your account.'
                    )}
                  </FieldSet>

                  <Buttons>
                    <Form.SubmitButton wide uppercase skin="primary">
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
                    <Link
                      as="a"
                      onClick={() => {
                        closeModal();
                        openModal(LoginModal);
                      }}
                    >
                      {__('Log in')}
                    </Link>
                  </ExtraSection>
                </>
              )}
            </Form>
          </ControlledModal.Body>
        </>
      )}
    </ControlledModal>
  );
}

function UserConfirmBackgroundTask({ username }) {
  const closeTaskRef = useRef();
  useEffect(
    () =>
      jotaiStore.sub(blocksAtom, () => {
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
            if (!jotaiStore.get(loggedInAtom) && !isModalOpen(LoginModal)) {
              openModal(LoginModal);
            }
          }
        };
      }),
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
