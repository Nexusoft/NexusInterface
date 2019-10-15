import React, { Component } from 'react';
import { reduxForm, Field } from 'redux-form';
import styled from '@emotion/styled';
import { connect } from 'react-redux';

import { apiPost } from 'lib/tritiumApi';
import Modal from 'components/Modal';
import FormField from 'components/FormField';
import TextField from 'components/TextField';
import Button from 'components/Button';
import Link from 'components/Link';
import NewUserModal from 'components/NewUserModal';
import { showNotification, openModal, removeModal } from 'lib/ui';
import { getUserStatus } from 'lib/user';
import { errorHandler, numericOnly } from 'utils/form';
import { updateSettings } from 'lib/settings';

const Buttons = styled.div({
  marginTop: '2em',
});

const ExtraSection = styled.div({
  marginTop: '2em',
  display: 'flex',
  justifyContent: 'space-between',
  opacity: 0.9,
});

/**
 * Login Form
 *
 * @class Login
 * @extends {Component}
 */
@connect(({ settings: { enableMining, enableStaking } }) => ({
  enableMining,
  enableStaking,
}))
@reduxForm({
  form: 'login_tritium',
  destroyOnUnmount: true,
  initialValues: {
    username: '',
    password: '',
    pin: '',
  },
  validate: ({ username, password, pin }, props) => {
    const errors = {};
    if (!username) {
      errors.username = __('Username is required');
    }

    if (!password) {
      errors.password = __('Password is required');
    }

    if (!pin) {
      errors.pin = __('PIN is required');
    }

    return errors;
  },
  onSubmit: ({ username, password, pin }) =>
    apiPost('users/login/user', {
      username,
      password,
      pin,
    }),
  onSubmitSuccess: async (result, dispatch, props) => {
    removeModal(props.modalId);
    props.reset();
    showNotification(
      __('Logged in as %{username}', { username: props.values.username }),
      'success'
    );

    await apiPost('users/unlock/user', {
      pin: props.values.pin,
      notifications: true,
      mining: !!props.enableMining,
      staking: !!props.enableStaking,
    });
    getUserStatus();
  },
  // TODO: replace error handler
  onSubmitFail: errorHandler(__('Error logging in')),
})
class Login extends Component {
  /**
   * Component's Renderable JSX
   *
   * @returns
   * @memberof Login
   */
  render() {
    const { handleSubmit, submitting } = this.props;

    return (
      <Modal
        style={{ maxWidth: 500 }}
        assignClose={closeModal => (this.closeModal = closeModal)}
      >
        <Modal.Header>{__('Log in')}</Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <FormField
              connectLabel
              label={__('Username')}
              style={{ marginTop: 0 }}
            >
              <Field
                component={TextField.RF}
                name="username"
                placeholder={__('Enter your username')}
                autoFocus
              />
            </FormField>

            <FormField connectLabel label={__('Password')}>
              <Field
                component={TextField.RF}
                name="password"
                type="password"
                placeholder={__('Enter your password')}
              />
            </FormField>

            <FormField connectLabel label={__('PIN')}>
              <Field
                component={TextField.RF}
                name="pin"
                type="password"
                normalize={numericOnly}
                placeholder={__('Enter your PIN number')}
              />
            </FormField>

            <Buttons>
              <Button
                type="submit"
                wide
                uppercase
                skin="primary"
                disabled={submitting}
              >
                {__('Log in')}
              </Button>
            </Buttons>

            <ExtraSection>
              <Link
                as="a"
                onClick={e => {
                  e.preventDefault();
                  this.closeModal();
                  updateSettings({ legacyMode: true });
                  location.reload();
                }}
              >
                {__('Switch to Legacy Mode')}
              </Link>
              <Link
                as="a"
                onClick={e => {
                  e.preventDefault();
                  this.closeModal();
                  openModal(NewUserModal);
                }}
              >
                {__('Create new user')}
              </Link>
            </ExtraSection>
          </form>
        </Modal.Body>
      </Modal>
    );
  }
}

export default Login;
