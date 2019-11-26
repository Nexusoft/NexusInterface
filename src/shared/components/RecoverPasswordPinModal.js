import React from 'react';
import { reduxForm, Field } from 'redux-form';

import { apiPost } from 'lib/tritiumApi';
import Modal from 'components/Modal';
import FormField from 'components/FormField';
import TextField from 'components/TextField';
import MaskableTextField from 'components/MaskableTextField';
import Button from 'components/Button';
import LoginModal from 'components/LoginModal';
import Spinner from 'components/Spinner';
import { showNotification, removeModal, openModal } from 'lib/ui';
import { errorHandler, numericOnly } from 'utils/form';
import confirmPasswordPin from 'utils/promisified/confirmPasswordPin';

@reduxForm({
  form: 'recover-password',
  destroyOnUnmount: true,
  initialValues: {
    username: '',
    recoveryPhrase: '',
    newPassword: '',
    newPin: '',
  },
  validate: ({ username, recoveryPhrase, newPassword, newPin }) => {
    const errors = {};

    if (!username) {
      errors.username = __('Username is required');
    }

    if (!recoveryPhrase) {
      errors.recoveryPhrase = __('Recovery phrase is required');
    }

    if (!newPassword) {
      errors.newPassword = __('New password is required');
    } else if (newPassword.length < 8) {
      errors.newPassword = __('Password must be at least 8 characters');
    }

    if (!newPin) {
      errors.newPin = __('New PIN is required');
    } else if (newPin.length < 4) {
      errors.newPin = __('PIN must be at least 4 characters');
    }

    return errors;
  },
  onSubmit: async ({ username, recoveryPhrase, newPassword, newPin }) => {
    const correct = await confirmPasswordPin({
      password: newPassword,
      pin: newPin,
    });

    if (correct) {
      return await apiPost('users/recover/user', {
        username,
        recovery: recoveryPhrase,
        password: newPassword,
        pin: newPin,
      });
    } else {
      return null;
    }
  },
  onSubmitSuccess: async (result, dispatch, props) => {
    if (!result) return;
    removeModal(props.modalId);
    props.reset();
    showNotification(__('Password & PIN have been updated'), 'success');
    openModal(LoginModal);
  },
  onSubmitFail: errorHandler(__('Error updating password & PIN')),
})
export default class RecoverPasswordPinModal extends React.Component {
  render() {
    const { handleSubmit, submitting } = this.props;
    return (
      <Modal
        assignClose={closeModal => (this.closeModal = closeModal)}
        style={{ maxWidth: 500 }}
      >
        <Modal.Header>{__('Recover password and PIN')}</Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <FormField label={__('Username')}>
              <Field
                name="username"
                component={TextField.RF}
                placeholder={__('Your username')}
                autoFocus
              />
            </FormField>

            <FormField label={__('Recovery phrase')}>
              <Field
                multiline
                rows={1}
                name="recoveryPhrase"
                component={TextField.RF}
                placeholder={__('Your recovery phrase')}
              />
            </FormField>

            <div className="mt2">
              <FormField connectLabel label={__('New Password')}>
                <Field
                  component={MaskableTextField.RF}
                  name="newPassword"
                  placeholder={__('Enter your new password')}
                />
              </FormField>

              <FormField connectLabel label={__('New PIN')}>
                <Field
                  component={MaskableTextField.RF}
                  name="newPin"
                  normalize={numericOnly}
                  placeholder={__('Enter your new PIN number')}
                />
              </FormField>
            </div>

            <div className="mt2">
              <Button skin="primary" wide type="submit" disabled={submitting}>
                {submitting ? (
                  <span>
                    <Spinner className="space-right" />
                    <span className="v-align">
                      {__('Recovering password & PIN')}...
                    </span>
                  </span>
                ) : (
                  __('Recover password & PIN')
                )}
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    );
  }
}
