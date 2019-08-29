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
import Switch from 'components/Switch';
import Link from 'components/Link';
import NewUserModal from 'components/NewUserModal';
import {
  showNotification,
  openErrorDialog,
  openModal,
  removeModal,
} from 'actions/overlays';
import { setCurrentUser } from 'actions/user';
import { errorHandler } from 'utils/form';

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
 *  Login Form
 *
 * @class Login
 * @extends {Component}
 */
@connect(
  state => ({ modalID: state.ui.modals[0].id }),
  { showNotification, openErrorDialog, openModal, removeModal, setCurrentUser }
)
@reduxForm({
  form: 'login_tritium',
  destroyOnUnmount: false,
  initialValues: {
    username: '',
    password: '',
    pin: '',
    unlockMinting: false,
    unlockTransactions: false,
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
  onSubmit: async (
    { username, password, pin, unlockMinting, unlockTransactions },
    dispatch,
    props
  ) => {
    const result = await apiPost('users/login/user', {
      username,
      password,
      pin,
    });

    props.showNotification(
      __('Logged in as %{username}', { username }),
      'success'
    );

    if (unlockMinting || unlockTransactions) {
      try {
        await apiPost('users/unlock/user', {
          pin,
          minting: !!unlockMinting,
          transactions: !!unlockTransactions,
        });
      } catch (err) {
        console.error(err);
      }
    }
    return result;
  },
  onSubmitSuccess: async (result, dispatch, props) => {
    props.setCurrentUser(props.values.username, result.genesis);
    props.reset();
    props.removeModal(props.modalID);
    autoFetchCoreInfo();
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
    const { handleSubmit, submitting, openModal } = this.props;

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
                placeholder={__('Pin')}
              />
            </FormField>

            <FormField
              inline
              connectLabel
              label={__('Unlock for staking & mining')}
              style={{ marginTop: '1.5em' }}
            >
              <Field component={Switch.RF} name="unlockMinting" />
            </FormField>

            <FormField
              inline
              connectLabel
              label={__('Unlock for sending transactions')}
            >
              <Field component={Switch.RF} name="unlockTransactions" />
            </FormField>

            <Buttons>
              <Button type="submit" wide skin="primary" disabled={submitting}>
                {__('Log in')}
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
