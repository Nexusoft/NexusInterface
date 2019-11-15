import React from 'react';
import { reduxForm, Field } from 'redux-form';

import { apiPost } from 'lib/tritiumApi';
import Modal from 'components/Modal';
import FormField from 'components/FormField';
import TextField from 'components/TextField';
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
  form: 'set-recovery-phrase',
  initialValues: {
    useRecoveryPhrase: true,
    password: '',
    pin: '',
    recoveryPhrase: '',
    newPassword: '',
    passwordConfirm: '',
    newPin: '',
    pinConfirm: '',
  },
  validate: ({
    useRecoveryPhrase,
    password,
    pin,
    recoveryPhrase,
    newPassword,
    passwordConfirm,
    newPin,
    pinConfirm,
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

    if (passwordConfirm !== newPassword) {
      errors.passwordConfirm = __('Password does not match');
    }

    if (!newPin) {
      errors.newPin = __('New PIN is required');
    }

    if (pinConfirm !== newPin) {
      errors.pinConfirm = __('PIN does not match');
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
                    type="password"
                    name="recoveryPhrase"
                    component={TextField.RF}
                    placeholder={__('Your recovery phrase')}
                  />
                </FormField>
              ) : (
                <>
                  <FormField label={__('Current password')}>
                    <Field
                      type="password"
                      name="password"
                      component={TextField.RF}
                      placeholder={__('Your current password')}
                    />
                  </FormField>

                  <FormField label={__('Current PIN')}>
                    <Field
                      type="password"
                      name="pin"
                      component={TextField.RF}
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
                component={TextField.RF}
                name="newPassword"
                type="password"
                placeholder={__('Enter your new password')}
              />
            </FormField>

            <FormField connectLabel label={__('Confirm password')}>
              <Field
                component={TextField.RF}
                name="passwordConfirm"
                type="password"
                placeholder={__('Re-enter your new password')}
              />
            </FormField>

            <FormField connectLabel label={__('New PIN')}>
              <Field
                component={TextField.RF}
                name="newPin"
                type="password"
                normalize={numericOnly}
                placeholder={__('Enter your new PIN number')}
              />
            </FormField>

            <FormField connectLabel label={__('Confirm PIN')}>
              <Field
                component={TextField.RF}
                name="pinConfirm"
                type="password"
                normalize={numericOnly}
                placeholder={__('Re-enter your new PIN number')}
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
