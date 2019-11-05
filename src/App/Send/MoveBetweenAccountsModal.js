// External
import React, { Component } from 'react';
import styled from '@emotion/styled';
import { connect } from 'react-redux';
import { reduxForm, Field, formValueSelector } from 'redux-form';

// Internal
import rpc from 'lib/rpc';
import Select from 'components/Select';
import Button from 'components/Button';
import Modal from 'components/Modal';
import Link from 'components/Link';
import {
  openConfirmDialog,
  openErrorDialog,
  openSuccessDialog,
  removeModal,
} from 'lib/ui';
import { loadAccounts } from 'lib/user';
import { errorHandler } from 'utils/form';
import {
  getAccountOptions,
  getRegisteredFieldNames,
  getAccountBalance,
} from './selectors';
import AmountField from './AmountField';

const AccountSelectors = styled.div({
  display: 'grid',
  gridTemplateColumns: 'auto 1fr',
  gridTemplateRows: 'auto auto',
  gridGap: '1em .5em',
  alignItems: 'center',
});

const Label = styled.label({
  paddingRight: '2em',
});

const Buttons = styled.div({
  marginTop: '1em',
  display: 'flex',
  justifyContent: 'flex-end',
});

const formName = 'moveBetweenAccounts';
const valueSelector = formValueSelector(formName);
const mapStateToProps = state => {
  const {
    settings: { minConfirmations, fiatCurrency },
    core: {
      info: { locked },
    },
    myAccounts,
    form,
  } = state;
  const accountName = valueSelector(state, 'moveFrom');
  const amount = valueSelector(state, 'amount');
  const accBalance = getAccountBalance(accountName, myAccounts);
  const hideSendAll = amount === accBalance;
  return {
    minConfirmations,
    fiatCurrency,
    locked,
    accountOptions: getAccountOptions(myAccounts),
    fieldNames: getRegisteredFieldNames(
      form[formName] && form[formName].registeredFields
    ),
    accBalance: hideSendAll ? undefined : accBalance,
  };
};

/**
 * Internal JXS for the Move Between Accounts Modal
 *
 * @class MoveBetweenAccountsForm
 * @extends {Component}
 */
@connect(mapStateToProps)
@reduxForm({
  form: formName,
  destroyOnUnmount: false,
  initialValues: {
    moveFrom: null,
    moveTo: null,
    amount: '',
    fiatAmount: '',
  },
  validate: ({ moveFrom, moveTo, amount }) => {
    const errors = {};
    if (!moveFrom) {
      errors.moveFrom = __('No accounts selected');
    }
    if (!moveTo) {
      errors.moveTo = __('No accounts selected');
    } else if (moveTo === moveFrom) {
      errors.moveTo = __('Cannot move to the same account');
    }
    if (!amount || parseFloat(amount) <= 0) {
      errors.amount = __('Invalid amount');
    }
    return errors;
  },
  asyncBlurFields: ['sendTo'],
  asyncValidate: async ({ sendTo }) => {
    if (sendTo) {
      try {
        const result = await rpc('validateaddress', [sendTo]);
        if (!result.isvalid) {
          throw { sendTo: __('Invalid address') };
        }
        if (result.ismine) {
          throw { sendTo: __('This is an address registered to this wallet.') };
        }
      } catch (err) {
        throw { sendTo: __('Invalid address') };
      }
    }
    return null;
  },
  onSubmit: ({ moveFrom, moveTo, amount }, dispatch, props) => {
    let minConfirmations = parseInt(props.minConfirmations);
    if (isNaN(minConfirmations)) {
      minConfirmations = defaultSettings.minConfirmations;
    }

    const params = [moveFrom, moveTo, parseFloat(amount)];
    return rpc('move', params, parseInt(props.minConfirmations));
  },
  onSubmitSuccess: (result, dispatch, props) => {
    props.closeModal();
    props.reset();
    loadAccounts();
    openSuccessDialog({
      message: __('NXS moved successfully'),
    });
  },
  onSubmitFail: errorHandler(__('Error moving NXS')),
})
class MoveBetweenAccountsForm extends Component {
  /**
   * Confirm Move
   *
   * @memberof MoveBetweenAccountsForm
   */
  confirmMove = e => {
    e.preventDefault();
    const { handleSubmit, invalid, locked, touch, fieldNames } = this.props;

    if (invalid) {
      // Mark the form touched so that the validation errors will be shown.
      // redux-form doesn't have the `touchAll` feature yet so we have to list all fields manually.
      // redux-form also doesn't have the API to get all the field names yet so we have to connect to the store to retrieve it manually
      touch(...fieldNames);
      return;
    }

    if (locked) {
      const {
        payload: { id: modalId },
      } = openErrorDialog({
        message: __('You are not logged in'),
        note: (
          <>
            <p>
              {__(
                'You need to log in to your wallet before sending transactions'
              )}
            </p>
            <Link
              to="/Settings/Security"
              onClick={() => {
                removeModal(modalId);
                this.props.closeModal();
              }}
            >
              {__('Log in now')}
            </Link>
          </>
        ),
      });
      return;
    }

    openConfirmDialog({
      question: __('Move NXS'),
      callbackYes: handleSubmit,
    });
  };

  /**
   * Component's Renderable JSX
   *
   * @returns
   * @memberof MoveBetweenAccountsForm
   */
  render() {
    const { accountOptions, accBalance, change, submitting } = this.props;
    return (
      <form onSubmit={this.confirmMove}>
        <AccountSelectors>
          <Label>{__('From account')}</Label>
          <Field
            component={Select.RF}
            name="moveFrom"
            options={accountOptions}
            placeholder={__('Select an account')}
          />

          <Label>{__('To account')}</Label>
          <Field
            component={Select.RF}
            name="moveTo"
            options={accountOptions}
            placeholder={__('Select an account')}
          />
        </AccountSelectors>

        <AmountField fullAmount={accBalance} change={change} />

        <Buttons>
          <Button skin="primary" type="submit" disabled={submitting}>
            {__('Move NXS')}
          </Button>
        </Buttons>
      </form>
    );
  }
}

/**
 * JSX for the Modal
 *
 * @memberof MoveBetweenAccountsForm
 *
 */
const MoveBetweenAccountsModal = () => (
  <Modal style={{ maxWidth: 650 }}>
    {closeModal => (
      <>
        <Modal.Header>{__('Move NXS between accounts')}</Modal.Header>

        <Modal.Body>
          <MoveBetweenAccountsForm closeModal={closeModal} />
        </Modal.Body>
      </>
    )}
  </Modal>
);

export default MoveBetweenAccountsModal;
