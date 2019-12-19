import React, { Component } from 'react';
import { reduxForm, Field } from 'redux-form';
import styled from '@emotion/styled';
import { connect } from 'react-redux';

import { apiPost } from 'lib/tritiumApi';
import Modal from 'components/Modal';
import FormField from 'components/FormField';
import TextField from 'components/TextField';
import MaskableTextField from 'components/MaskableTextField';
import Button from 'components/Button';
import NewUserModal from 'components/NewUserModal';
import RecoverPasswordPinModal from 'components/RecoverPasswordPinModal';
import Spinner from 'components/Spinner';
import { showNotification, openModal, removeModal } from 'lib/ui';
import { getUserStatus } from 'lib/user';
import { errorHandler } from 'utils/form';

__ = __context('Login');

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
                component={MaskableTextField.RF}
                name="password"
                placeholder={__('Enter your password')}
              />
            </FormField>

            <FormField connectLabel label={__('PIN')}>
              <Field
                component={MaskableTextField.RF}
                name="pin"
                placeholder={__('Enter your PIN')}
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
                {submitting ? (
                  <span>
                    <Spinner className="space-right" />
                    <span className="v-align">{__('Logging in')}...</span>
                  </span>
                ) : (
                  __('Log in')
                )}
              </Button>
            </Buttons>

            <ExtraSection>
              <Button
                skin="hyperlink"
                onClick={() => {
                  this.closeModal();
                  openModal(RecoverPasswordPinModal);
                }}
              >
                {__('Forgot password?')}
              </Button>
              <Button
                skin="hyperlink"
                onClick={() => {
                  this.closeModal();
                  openModal(NewUserModal);
                }}
              >
                {__('Create new user')}
              </Button>
            </ExtraSection>
          </form>
        </Modal.Body>
      </Modal>
    );
  }
}

export default Login;
