// External
import React, { Component } from 'react';
import styled from '@emotion/styled';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';

// Internal
import rpc from 'lib/rpc';
import Text from 'components/Text';
import Select from 'components/Select';
import Button from 'components/Button';
import Modal from 'components/Modal';
import Link from 'components/Link';
import {
  openConfirmDialog,
  openErrorDialog,
  openSuccessDialog,
  removeModal,
} from 'actions/overlays';
import { loadMyAccounts } from 'actions/account';
import { rpcErrorHandler } from 'utils/form';
import { getAccountOptions, getRegisteredFieldNames } from './selectors';
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

const mapStateToProps = ({
  settings: { minConfirmations, fiatCurrency },
  core: {
    info: { locked },
  },
  myAccounts,
  form,
}) => ({
  minConfirmations,
  fiatCurrency,
  locked,
  accountOptions: getAccountOptions(myAccounts),
  fieldNames: getRegisteredFieldNames(
    form.moveBetweenAccounts && form.moveBetweenAccounts.registeredFields
  ),
});

const acctionCreators = {
  loadMyAccounts,
  openConfirmDialog,
  openErrorDialog,
  openSuccessDialog,
  removeModal,
};

/**
 * Internal JXS for the Move Between Accounts Modal
 *
 * @class MoveBetweenAccountsForm
 * @extends {Component}
 */
@connect(
  mapStateToProps,
  acctionCreators
)
@reduxForm({
  form: 'moveBetweenAccounts',
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
      errors.moveFrom = _('No accounts selected');
    }
    if (!moveTo) {
      errors.moveTo = _('No accounts selected');
    } else if (moveTo === moveFrom) {
      errors.moveTo = _('Cannot move to the same account');
    }
    if (!amount || parseFloat(amount) <= 0) {
      errors.amount = _('Invalid amount');
    }
    return errors;
  },
  asyncBlurFields: ['sendTo'],
  asyncValidate: async ({ sendTo }) => {
    if (sendTo) {
      try {
        const result = await rpc('validateaddress', [sendTo]);
        if (!result.isvalid) {
          throw { sendTo: _('Invalid address') };
        }
        if (result.ismine) {
          throw { sendTo: _('This is an address registered to this wallet.') };
        }
      } catch (err) {
        throw { sendTo: _('Invalid address') };
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
    props.loadMyAccounts();
    props.openSuccessDialog({
      message: _('NXS moved successfully'),
    });
  },
  onSubmitFail: rpcErrorHandler(_('Error moving NXS')),
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
      } = this.props.openErrorDialog({
        message: _('You are not logged in'),
        note: (
          <>
            <p>
              {_(
                'You need to log in to your wallet before sending transactions'
              )}
            </p>
            <Link
              to="/Settings/Security"
              onClick={() => {
                this.props.removeModal(modalId);
                this.props.closeModal();
              }}
            >
              {_('Log in now')}
            </Link>
          </>
        ),
      });
      return;
    }

    this.props.openConfirmDialog({
      question: _('Move NXS'),
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
    return (
      <form onSubmit={this.confirmMove}>
        <AccountSelectors>
          <Label>{_('From account')}</Label>
          <Field
            component={Select.RF}
            name="moveFrom"
            options={this.props.accountOptions}
            placeholder={_('Select an account')}
          />

          <Label>{_('To account')}</Label>
          <Field
            component={Select.RF}
            name="moveTo"
            options={this.props.accountOptions}
            placeholder={_('Select an account')}
          />
        </AccountSelectors>

        <AmountField change={this.props.change} />

        <Buttons>
          <Button skin="primary" type="submit" disabled={this.props.submitting}>
            {_('Move NXS')}
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
        <Modal.Header>{_('Move NXS between accounts')}</Modal.Header>

        <Modal.Body>
          <MoveBetweenAccountsForm closeModal={closeModal} />
        </Modal.Body>
      </>
    )}
  </Modal>
);

export default MoveBetweenAccountsModal;
