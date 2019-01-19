// External
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import styled from '@emotion/styled';

// Internal
import Text from 'components/Text';
import FormField from 'components/FormField';
import TextField from 'components/TextField';
import Button from 'components/Button';
import FieldSet from 'components/FieldSet';
import UIController from 'components/UIController';
import * as RPC from 'scripts/rpc';
import * as TYPE from 'actions/actiontypes';
import { rpcErrorHandler, trimText } from 'utils/form';

const ImportPrivKeyForm = styled.form({
  flex: 3,
});

@connect(
  null,
  dispatch => ({
    ResetForEncryptionRestart: () => dispatch({ type: TYPE.CLEAR_FOR_RESTART }),
  })
)
@reduxForm({
  form: 'importPrivateKey',
  initialValues: {
    accountName: '',
    privateKey: '',
  },
  validate: ({ accountName, privateKey }) => {
    const errors = {};
    if (!accountName) {
      errors.accountName = 'Account name is required';
    }
    if (!privateKey) {
      errors.privateKey = 'Private key is required';
    }
    return errors;
  },
  onSubmit: ({ accountName, privateKey }) =>
    RPC.PROMISE('importprivkey', [privateKey], [accountName]),
  onSubmitSuccess: async () => {
    // this.props.ResetForEncryptionRestart();
    UIController.openSuccessDialog({
      message: 'Private key imported. Rescanning now',
    });
    UIController.showNotification('Rescanning...');
    try {
      await RPC.PROMISE('rescan');
      UIController.showNotification('Rescanning done', 'success');
    } catch (err) {
      UIController.openErrorDialog({
        message: 'Error Rescanning',
        note: (err && err.message) || 'An unknown error occurred',
      });
    }
  },
  onSubmitFail: rpcErrorHandler('Error importing private key'),
})
export default class ImportPrivKey extends Component {
  render() {
    const { handleSubmit, submitting } = this.props;
    return (
      <ImportPrivKeyForm onSubmit={handleSubmit}>
        <FieldSet legend={<Text id="Settings.ImportPrivateKey" />}>
          <Text id="Settings.AccountName">
            {An => (
              <FormField
                connectLabel
                label={<Text id="Settings.AccountName" />}
              >
                <Field
                  component={TextField.RF}
                  name="accountName"
                  type="Text"
                  placeholder={An}
                  normalize={trimText}
                />
              </FormField>
            )}
          </Text>
          <Text id="Settings.PrivateKey">
            {pk => (
              <FormField connectLabel label={<Text id="Settings.PrivateKey" />}>
                <Field
                  component={TextField.RF}
                  name="privateKey"
                  type="password"
                  placeholder={pk}
                  normalize={trimText}
                />
              </FormField>
            )}
          </Text>
          <Button
            type="submit"
            skin="primary"
            wide
            disabled={submitting}
            waiting={submitting}
            style={{ marginTop: '2em' }}
          >
            Import
          </Button>
        </FieldSet>
      </ImportPrivKeyForm>
    );
  }
}
