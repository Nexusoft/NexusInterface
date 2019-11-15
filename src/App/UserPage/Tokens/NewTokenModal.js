import React from 'react';
import { connect } from 'react-redux';
import { reduxForm, Field, formValueSelector } from 'redux-form';
import styled from '@emotion/styled';

import Modal from 'components/Modal';
import Button from 'components/Button';
import TextField from 'components/TextField';
import FormField from 'components/FormField';
import confirm from 'utils/promisified/confirm';
import confirmPin from 'utils/promisified/confirmPin';
import { apiPost } from 'lib/tritiumApi';
import { errorHandler } from 'utils/form';
import { loadAccounts, loadOwnedTokens } from 'lib/user';
import { removeModal, showNotification } from 'lib/ui';
import NewAccountModal from 'components/UserDialogs/NewAccountModal';
import { openModal } from 'lib/ui';

import { token, localName } from 'lib/fees';
import GA from 'lib/googleAnalytics';

const SubLable = styled.span(({ theme }) => ({
  marginLeft: '1em',
  fontSize: '75%',
  color: theme.mixer(0.5),
}));

const mapStateToProps = state => {
  const valueSelector = formValueSelector('new_token');

  return {
    supply: valueSelector(state, 'supply'),
    decimal: valueSelector(state, 'decimals'),
  };
};

@connect(mapStateToProps)
@reduxForm({
  form: 'new_token',
  destroyOnUnmount: true,
  initialValues: {
    name: '',
    supply: null,
    decimals: null,
  },
  validate: ({ name, supply, decimals }) => {
    const errors = {};

    if (supply <= 0) {
      errors.supply = __('Supply can not be zero or negative');
    }

    return errors;
  },
  onSubmit: async ({ name, supply, decimals }) => {
    if (!name) {
      const confirmed = await confirm({
        question: __('Create a token without a name?'),
        note: __('Adding a name costs a NXS fee'),
        labelYes: __("That's Ok"),
        labelNo: __('Cancel'),
      });

      if (!confirmed) {
        throw { name: __('Add Name') };
      }
    }

    const pin = await confirmPin();
    if (pin) {
      const params = { pin, supply, decimals };
      if (name) params.name = name;
      return await apiPost('tokens/create/token', params);
    }
  },
  onSubmitSuccess: async (result, dispatch, props) => {
    if (!result) return; // Submission was cancelled
    GA.SendEvent('Users', 'NewToken', 'Token', 1);
    showNotification(
      __('New token %{token} has been created', {
        token: props.values.name,
      }),
      'success'
    );
    loadOwnedTokens();
    removeModal(props.modalId);
    const createAccount = await confirm({
      question: __(
        'You have successfully created token %{token} ! Would you like to make an account for this token?',
        { token: props.values.name }
      ),
      labelYes: __('Yes'),
      labelNo: __('No'),
    });

    if (createAccount) {
      openModal(
        NewAccountModal,
        props.values.name
          ? { tokenName: props.values.name }
          : { tokenAddress: result.address }
      );
    }

    loadAccounts();
  },
  onSubmitFail: errorHandler(__('Error creating token')),
})
class NewTokenModal extends React.Component {
  render() {
    const { handleSubmit, submitting, supply, decimal } = this.props;
    const tokenNameCreationFee = localName;
    const tokenCreationFee = token(supply, decimal);
    return (
      <Modal
        assignClose={closeModal => {
          this.closeModal = closeModal;
        }}
        style={{ maxWidth: 400 }}
      >
        <Modal.Header>{__('New Token')}</Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            {__(
              `There is a %{tokenfee}NXS token creation fee, based on supply`,
              {
                tokenfee: tokenCreationFee,
              }
            )}
            <FormField connectLabel label={__('Token name')}>
              <>
                <SubLable>
                  {__('Name Creation Fee: %{tokenFee} NXS (Optional)', {
                    tokenFee: tokenNameCreationFee,
                  })}
                </SubLable>
                <Field
                  name="name"
                  component={TextField.RF}
                  placeholder={__("New tokens's name")}
                />
              </>
            </FormField>
            <FormField connectLabel label={__('Supply')}>
              <>
                <SubLable> {__('Max amount of tokens available')}</SubLable>
                <Field
                  name="supply"
                  component={TextField.RF}
                  placeholder={'10000'}
                />
              </>
            </FormField>
            <FormField connectLabel label={__('Decimal')}>
              <>
                <SubLable>
                  {__('Amount of significant digits a token can have')}{' '}
                </SubLable>
                <Field
                  name="decimals"
                  component={TextField.RF}
                  placeholder={'4'}
                />
              </>
            </FormField>

            <div className="mt3 flex space-between">
              <Button
                onClick={() => {
                  this.closeModal();
                }}
              >
                {__('Cancel')}
              </Button>
              <Button skin="primary" type="submit" disabled={submitting}>
                {__('Create token')}
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    );
  }
}

export default NewTokenModal;
