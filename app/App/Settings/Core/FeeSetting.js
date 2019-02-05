// External
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';

// Internal
import Text from 'components/Text';
import * as RPC from 'scripts/rpc';
import SettingsField from 'components/SettingsField';
import Button from 'components/Button';
import TextField from 'components/TextField';
import UIController from 'components/UIController';
import { rpcErrorHandler } from 'utils/form';

/**
 * Returns JSX For Fee Settings
 *
 * @class FeeSetting
 * @extends {React.Component}
 */
@connect(state => ({
  initialValues: {
    txFee: state.overview.paytxfee,
  },
}))
@reduxForm({
  form: 'setTransactionFee',
  destroyOnUnmount: false,
  validate: ({ txFee }) => {
    const errors = {};
    if (parseFloat(txFee) <= 0) {
      errors.txFee = <Text id="Alert.InvalidTransactionFee" />;
    }
    return errors;
  },
  onSubmit: ({ txFee }) => RPC.PROMISE('settxfee', [parseFloat(txFee)]),
  onSubmitSuccess: () => {
    UIController.showNotification(
      <Text id="Alert.TransactionFeeSet" />,
      'success'
    );
  },
  onSubmitFail: rpcErrorHandler(<Text id="Settings.Errors.SettingTxFee" />),
})
class FeeSetting extends React.Component {
  /**
   * Confirms Set TX fee
   *
   * @memberof FeeSetting
   */
  confirmSetTxFee = () => {
    UIController.openConfirmDialog({
      question: <Text id="Settings.SetFee" />,
      yesCallback: this.props.handleSubmit,
    });
  };

  /**
   * React Render
   *
   * @returns
   * @memberof FeeSetting
   */
  render() {
    const { pristine, submitting } = this.props;
    return (
      <SettingsField
        connectLabel
        label={<Text id="Settings.OptionalFee" />}
        subLabel={<Text id="ToolTip.OptionalFee" />}
      >
        {inputId => (
          <div className="flex stretch">
            <Field
              component={TextField.RF}
              id={inputId}
              name="txFee"
              type="number"
              step="0.01"
              min="0"
              normalize={parseFloat}
              style={{ width: 100 }}
            />
            <Button
              disabled={pristine || submitting}
              fitHeight
              onClick={this.confirmSetTxFee}
              style={{ marginLeft: '1em' }}
            >
              Set
            </Button>
          </div>
        )}
      </SettingsField>
    );
  }
}
export default FeeSetting;