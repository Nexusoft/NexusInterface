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
import {
  openErrorDialog,
  openSuccessDialog,
  showNotification,
} from 'actions/overlays';
import rpc from 'lib/rpc';
import { rpcErrorHandler, trimText } from 'utils/form';

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
      errors.accountName = <Text id="Settings.Errors.AccountName" />;
    }
    if (!privateKey) {
      errors.privateKey = <Text id="Settings.Errors.PrivateKey" />;
    }
    return errors;
  },
  onSubmit: ({ accountName, privateKey }) =>
    rpc('importprivkey', [privateKey], [accountName]),
  onSubmitSuccess: async (result, dispatch, props) => {
    props.reset();
    props.openSuccessDialog({
      message: <Text id="Settings.PrivKeyImported" />,
    });
    props.showNotification(<Text id="Settings.Rescanning" />);
    try {
      await rpc('rescan', []);
      props.showNotification(<Text id="Settings.RescanningDone" />, 'success');
    } catch (err) {
      props.openErrorDialog({
        message: <Text id="Settings.Errors.Rescanning" />,
        note: (err && err.message) || <Text id="Common.UnknownError" />,
      });
    }
  },
  onSubmitFail: rpcErrorHandler(<Text id="Settings.Errors.ImportingPrivKey" />),
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
            <Text id="Settings.Import" />
          </Button>
        </FieldSet>
      </ImportPrivKeyForm>
    );
  }
}
export default ImportPrivKey;
