import { reduxForm, Field, Fields } from 'redux-form';
import styled from '@emotion/styled';

import ControlledModal from 'components/ControlledModal';
import Button from 'components/Button';
import TextField from 'components/TextField';
import FormField from 'components/FormField';
import { confirm, confirmPin } from 'lib/dialog';
import { callApi } from 'lib/tritiumApi';
import { errorHandler } from 'utils/form';
import { loadAccounts, loadOwnedTokens } from 'lib/user';
import { openModal, removeModal, showNotification } from 'lib/ui';
import NewAccountModal from 'components/NewAccountModal';

import { createTokenFee, createLocalNameFee } from 'lib/fees';
import GA from 'lib/googleAnalytics';

__ = __context('User.Tokens.NewToken');

const SubLable = styled.span(({ theme }) => ({
  marginLeft: '1em',
  fontSize: '75%',
  color: theme.mixer(0.5),
}));

function FeeMessage({ supply, decimals }) {
  return __(`There is a %{tokenfee} NXS token creation fee, based on supply`, {
    tokenfee: createTokenFee(supply.input.value, decimals.input.value),
  });
}

const formOptions = {
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
      return await callApi('tokens/create/token', params);
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
};

function NewTokenModal({ handleSubmit, submitting }) {
  return (
    <ControlledModal maxWidth={400}>
      {(closeModal) => (
        <>
          <ControlledModal.Header>{__('New Token')}</ControlledModal.Header>
          <ControlledModal.Body>
            <form onSubmit={handleSubmit}>
              <Fields names={['supply', 'decimals']} component={FeeMessage} />

              <FormField connectLabel label={__('Token name')}>
                <>
                  <SubLable>
                    {__('Name Creation Fee: %{tokenFee} NXS (Optional)', {
                      tokenFee: createLocalNameFee,
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
                    closeModal();
                  }}
                >
                  {__('Cancel')}
                </Button>
                <Button skin="primary" type="submit" disabled={submitting}>
                  {__('Create token')}
                </Button>
              </div>
            </form>
          </ControlledModal.Body>
        </>
      )}
    </ControlledModal>
  );
}

export default reduxForm(formOptions)(NewTokenModal);
