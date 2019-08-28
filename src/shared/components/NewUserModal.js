import React, { Component } from 'react';
import { reduxForm, Field } from 'redux-form';
import styled from '@emotion/styled';
import { connect } from 'react-redux';

import { autoFetchCoreInfo } from 'lib/coreInfo';
import { apiPost } from 'lib/tritiumApi';
import Modal from 'components/Modal';
import FormField from 'components/FormField';
import TextField from 'components/TextField';
import Button from 'components/Button';
import Link from 'components/Link';
import LoginModal from 'components/LoginModal';
import { rpcErrorHandler } from 'utils/form';
import { showNotification, openErrorDialog, openModal } from 'actions/overlays';

const Buttons = styled.div({
  marginTop: '1.5em',
});

const ExtraSection = styled.div({
  marginTop: '2em',
  display: 'flex',
  justifyContent: 'space-between',
  opacity: 0.9,
});

/**
 *  NewUserModal Form
 *
 * @class NewUserModal
 * @extends {Component}
 */
@connect(
  null,
  { showNotification, openErrorDialog, openModal }
)
@reduxForm({
  form: 'new_user',
  destroyOnUnmount: false,
  initialValues: {
    username: '',
    password: '',
    passwordConfirm: '',
    pin: '',
    pinConfirm: '',
  },
  validate: (
    { username, password, passwordConfirm, pin, pinConfirm },
    props
  ) => {
    const errors = {};

    // TODO: add length validation
    if (!username) {
      errors.username = __('Username is required');
    }

    if (!password) {
      errors.password = __('Password is required');
    }

    if (passwordConfirm !== password) {
      errors.passwordConfirm = __('Password does not match');
    }

    if (!pin) {
      errors.pin = __('PIN is required');
    }

    if (pinConfirm !== pin) {
      errors.pinConfirm = __('PIN does not match');
    }

    return errors;
  },
  onSubmit: async ({ username, password, pin }, dispatch, props) => {
    const result = await apiPost('users/create/user', {
      username,
      password,
      PIN: pin,
    });
    props.showNotification(
      __('New user %{username} has been created', { username }),
      'success'
    );

    try {
      await apiPost('users/login/user', {
        username,
        password,
        PIN: pin,
      });
    } catch (err) {
      console.error(err);
    }
    return result;
  },
  onSubmitSuccess: async (result, dispatch, props) => {
    props.reset();
    autoFetchCoreInfo();
  },
  // TODO: replace error handler
  onSubmitFail: rpcErrorHandler(__('Error logging in')),
})
class NewUserModal extends Component {
  /**
   * Component's Renderable JSX
   *
   * @returns
   * @memberof NewUserModal
   */
  render() {
    const { handleSubmit, submitting, openModal } = this.props;

    return (
      <Modal
        style={{ maxWidth: 500 }}
        assignClose={closeModal => (this.closeModal = closeModal)}
      >
        <Modal.Header>{__('Create new user')}</Modal.Header>
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
                placeholder={__('A globally unique username')}
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

            <FormField connectLabel label={__('Confirm password')}>
              <Field
                component={TextField.RF}
                name="passwordConfirm"
                type="password"
                placeholder={__('Re-enter your password')}
              />
            </FormField>

            <FormField connectLabel label={__('PIN')}>
              <Field
                component={TextField.RF}
                name="pin"
                type="password"
                placeholder={__('Enter your PIN')}
              />
            </FormField>

            <FormField connectLabel label={__('Confirm PIN')}>
              <Field
                component={TextField.RF}
                name="pinConfirm"
                type="password"
                placeholder={__('Re-enter your PIN')}
              />
            </FormField>

            <Buttons>
              <Button type="submit" wide skin="primary" disabled={submitting}>
                {__('Create user')}
              </Button>
            </Buttons>

            <ExtraSection>
              <Link as="a" href="javascript:;">
                {__('Switch to Legacy Mode')}
              </Link>
              <Link
                as="a"
                href="javascript:;"
                onClick={() => {
                  this.closeModal();
                  openModal(LoginModal);
                }}
              >
                {__('Log in')}
              </Link>
            </ExtraSection>
          </form>
        </Modal.Body>
      </Modal>
    );
  }
}

export default NewUserModal;
