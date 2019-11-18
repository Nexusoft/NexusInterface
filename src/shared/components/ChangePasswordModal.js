import React from 'react';
import { reduxForm, Field } from 'redux-form';

import { apiPost } from 'lib/tritiumApi';
import Modal from 'components/Modal';
import FormField from 'components/FormField';
import TextField from 'components/TextField';
import MaskableTextField from 'components/MaskableTextField';
import Button from 'components/Button';
import Select from 'components/Select';
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
    useRecoveryPhrase: true,
    password: '',
    pin: '',
    recoveryPhrase: '',
    newPassword: '',
    newPin: '',
  },
  validate: ({
    useRecoveryPhrase,
    password,
    pin,
    recoveryPhrase,
    newPassword,
    newPin,
  }) => {
    const errors = {};

    if (!useRecoveryPhrase && !password) {
      errors.password = __('Password is required');
    }

    if (!useRecoveryPhrase && !pin) {
      errors.pin = __('PIN is required');
    }

    if (useRecoveryPhrase && !recoveryPhrase) {
      errors.recoveryPhrase = __('Recovery phrase is required');
    }

    if (!newPassword) {
      errors.newPassword = __('New password is required');
    }

    if (!newPin) {
      errors.newPin = __('New PIN is required');
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
          <Field
            name="useRecoveryPhrase"
            component={Select.RF}
            options={options}
          />

          <Field
            name="useRecoveryPhrase"
            component={({ input }) =>
              input.value ? (
                <FormField label={__('Recovery phrase')}>
                  <Field
                    multiline
                    rows={1}
                    name="recoveryPhrase"
                    component={MaskableTextField.RF}
                    placeholder={__('Your recovery phrase')}
                  />
                </FormField>
              ) : (
                <>
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
                </>
              )
            }
          />

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
              {__('Change password & PIN')}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    );
  }
}
