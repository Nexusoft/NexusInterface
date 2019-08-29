// External
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import styled from '@emotion/styled';

// Internal
import FormField from 'components/FormField';
import TextField from 'components/TextField';
import Button from 'components/Button';
import FieldSet from 'components/FieldSet';
import {
  openErrorDialog,
  openSuccessDialog,
  showNotification,
} from 'actions/overlays';
import rpc from 'lib/rpc';
import { errorHandler, trimText } from 'utils/form';

const ImportPrivKeyForm = styled.form({
  flex: 3,
});

/**
 * Import Private Keys
 *
 * @class ImportPrivKey
 * @extends {Component}
 */
@connect(
  null,
  {
    openErrorDialog,
    openSuccessDialog,
    showNotification,
  }
)
@reduxForm({
  form: 'importPrivateKey',
  destroyOnUnmount: false,
  initialValues: {
    accountName: '',
    privateKey: '',
  },
  validate: ({ accountName, privateKey }) => {
    const errors = {};
    if (!accountName) {
      errors.accountName = __('Account name is required');
    }
    if (!privateKey) {
      errors.privateKey = __('Private key is required');
    }
    return errors;
  },
  onSubmit: ({ accountName, privateKey }) =>
    rpc('importprivkey', [privateKey], [accountName]),
  onSubmitSuccess: async (result, dispatch, props) => {
    props.reset();
    props.openSuccessDialog({
      message: __('Private key imported. Rescanning now'),
    });
    props.showNotification(__('Rescanning...'));
    try {
      await rpc('rescan', []);
      props.showNotification(__('Rescanning done'), 'success');
    } catch (err) {
      props.openErrorDialog({
        message: __('Error rescanning'),
        note: (err && err.message) || __('An unknown error occurred'),
      });
    }
  },
  onSubmitFail: errorHandler(__('Error importing private key')),
})
class ImportPrivKey extends Component {
  /**
   *  Component's Renderable JSX
   *
   * @returns
   * @memberof ImportPrivKey
   */
  render() {
    const { handleSubmit, submitting } = this.props;
    return (
      <ImportPrivKeyForm onSubmit={handleSubmit}>
        <FieldSet legend={__('Import private key')}>
          <FormField connectLabel label={__('Account name')}>
            <Field
              component={TextField.RF}
              name="accountName"
              type="Text"
              placeholder={__('Account name')}
              normalize={trimText}
            />
          </FormField>
          <FormField connectLabel label={__('Private key')}>
            <Field
              component={TextField.RF}
              name="privateKey"
              type="password"
              placeholder={__('Private key')}
              normalize={trimText}
            />
          </FormField>
          <Button
            type="submit"
            skin="primary"
            wide
            disabled={submitting}
            waiting={submitting}
            style={{ marginTop: '2em' }}
          >
            {__('Import')}
          </Button>
        </FieldSet>
      </ImportPrivKeyForm>
    );
  }
}
export default ImportPrivKey;
