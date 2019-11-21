import React from 'react';
import { reduxForm, Field } from 'redux-form';

import { apiPost } from 'lib/tritiumApi';
import Modal from 'components/Modal';
import FormField from 'components/FormField';
import MaskableTextField from 'components/MaskableTextField';
import Button from 'components/Button';
import { errorHandler, numericOnly } from 'utils/form';

const options = [
  {
    value: false,
    display: __('Use current password & PIN'),
  },
  {
    value: true,
    display: __('Use recovery phrase'),
  },
];

@reduxForm({
  form: 'change-password',
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
})
export default class ChangePasswordModal extends React.Component {
  render() {
    return (
      <Modal
        assignClose={closeModal => (this.closeModal = closeModal)}
        style={{ maxWidth: 500 }}
      >
        <Modal.Header>{__('Change password and PIN')}</Modal.Header>
        <Modal.Body>
          <FormField label={__('Current password')}>
            <Field
              name="password"
              component={MaskableTextField.RF}
              placeholder={__('Your current password')}
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
            <Button skin="primary" wide>
              {__('Set new password & PIN')}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    );
  }
}
