import React from 'react';
import { reduxForm, Field } from 'redux-form';

import { apiPost } from 'lib/tritiumApi';
import Modal from 'components/Modal';
import FormField from 'components/FormField';
import MaskableTextField from 'components/MaskableTextField';
import Button from 'components/Button';
import Spinner from 'components/Spinner';
import { errorHandler, numericOnly } from 'utils/form';
import { showNotification, removeModal, openModal } from 'lib/ui';
import confirmPasswordPin from 'utils/promisified/confirmPasswordPin';

@reduxForm({
  form: 'change-password',
  destroyOnUnmount: true,
  initialValues: {
    password: '',
    pin: '',
    newPassword: '',
    newPin: '',
  },
  validate: ({ password, pin, newPassword, newPin }) => {
    const errors = {};

    if (!password) {
      errors.password = __('Current password is required');
    }

    if (!pin) {
      errors.pin = __('Current PIN is required');
    }

    if (!newPassword) {
      errors.newPassword = __('New password is required');
    } else if (password.length < 8) {
      errors.password = __('Password must be at least 8 characters');
    }

    if (!newPin) {
      errors.newPin = __('New PIN is required');
    } else if (pin.length < 4) {
      errors.pin = __('PIN must be at least 4 characters');
    }

    return errors;
  },
  onSubmit: async ({ password, pin, newPassword, newPin }) => {
    const correct = await confirmPasswordPin({
      isNew: true,
      password: newPassword,
      pin: newPin,
    });

    if (correct) {
      return await apiPost('users/update/user', {
        password,
        pin,
        new_password: newPassword,
        new_pin: newPin,
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
  },
  onSubmitFail: errorHandler(__('Error updating password & PIN')),
})
export default class ChangePasswordPinModal extends React.Component {
  render() {
    const { handleSubmit, submitting } = this.props;
    return (
      <Modal
        assignClose={closeModal => (this.closeModal = closeModal)}
        style={{ maxWidth: 500 }}
      >
        <Modal.Header>{__('Change password and PIN')}</Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <FormField label={__('Current password')}>
              <Field
                name="password"
                component={MaskableTextField.RF}
                placeholder={__('Your current password')}
                autoFocus
              />
            </FormField>

            <FormField label={__('Current PIN')}>
              <Field
                name="pin"
                component={MaskableTextField.RF}
                placeholder={__('Your current PIN number')}
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
                    <span className="v-align">{__('Updating')}...</span>
                  </span>
                ) : (
                  __('Update')
                )}
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    );
  }
}
