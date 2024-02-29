import styled from '@emotion/styled';

import Form from 'components/Form';
import ControlledModal from 'components/ControlledModal';
import Button from 'components/Button';
import FormField from 'components/FormField';
import { formSubmit, checkAll, useFieldValue } from 'lib/form';
import { confirm, confirmPin } from 'lib/dialog';
import { callAPI } from 'lib/api';
import { loadAccounts, loadOwnedTokens } from 'lib/user';
import { openModal, showNotification } from 'lib/ui';
import NewAccountModal from 'components/NewAccountModal';

import { createTokenFee, createLocalNameFee } from 'lib/fees';
import UT from 'lib/usageTracking';

__ = __context('User.Tokens.NewToken');

const SubLabel = styled.span(({ theme }) => ({
  marginLeft: '1em',
  fontSize: '75%',
  color: theme.mixer(0.5),
}));

function FeeMessage() {
  const supply = useFieldValue('supply');
  const decimals = useFieldValue('decimals');
  return __(`There is a %{tokenfee} NXS token creation fee, based on supply`, {
    tokenfee: createTokenFee(supply, decimals),
  });
}

const initialValues = {
  name: '',
  supply: null,
  decimals: null,
};

const isInteger = (value) =>
  !Number.isInteger(Number(value)) ? __('Must be an integer') : undefined;

const positiveNumber = (value) =>
  value <= 0 ? __('Supply cannot be zero or negative') : undefined;

export default function NewTokenModal() {
  return (
    <ControlledModal maxWidth={400}>
      {(closeModal) => (
        <>
          <ControlledModal.Header>{__('New Token')}</ControlledModal.Header>
          <ControlledModal.Body>
            <Form
              name="new_token"
              initialValues={initialValues}
              onSubmit={formSubmit({
                submit: async ({ name, supply, decimals }) => {
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
                    return await callAPI('tokens/create/token', params);
                  }
                },
                onSuccess: async (result, { name }) => {
                  if (!result) return; // Submission was cancelled
                  UT.CreateNewItem('token');
                  showNotification(
                    __('New token %{token} has been created', {
                      token: name,
                    }),
                    'success'
                  );
                  loadOwnedTokens();
                  closeModal();
                  const createAccount = await confirm({
                    question: __(
                      'You have successfully created token %{token} ! Would you like to make an account for this token?',
                      { token: name }
                    ),
                    labelYes: __('Yes'),
                    labelNo: __('No'),
                  });

                  if (createAccount) {
                    openModal(
                      NewAccountModal,
                      name
                        ? { tokenName: name }
                        : { tokenAddress: result.address }
                    );
                  }

                  loadAccounts();
                },
                errorMessage: __('Error creating token'),
              })}
            >
              <FeeMessage />

              <FormField connectLabel label={__('Token name')}>
                <>
                  <SubLabel>
                    {__('Name Creation Fee: %{tokenFee} NXS (Optional)', {
                      tokenFee: createLocalNameFee,
                    })}
                  </SubLabel>
                  <Form.TextField
                    name="name"
                    placeholder={__("New tokens's name")}
                  />
                </>
              </FormField>
              <FormField connectLabel label={__('Supply')}>
                <>
                  <SubLabel> {__('Max amount of tokens available')}</SubLabel>
                  <Form.TextField
                    name="supply"
                    type="number"
                    min={1}
                    placeholder={'10000'}
                    validate={checkAll(isInteger, positiveNumber)}
                  />
                </>
              </FormField>
              <FormField connectLabel label={__('Decimal')}>
                <>
                  <SubLabel>
                    {__('Amount of significant digits a token can have')}{' '}
                  </SubLabel>
                  <Form.TextField name="decimals" placeholder={'4'} />
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
                <Form.SubmitButton skin="primary">
                  {__('Create token')}
                </Form.SubmitButton>
              </div>
            </Form>
          </ControlledModal.Body>
        </>
      )}
    </ControlledModal>
  );
}
