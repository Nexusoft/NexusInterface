import ControlledModal from 'components/ControlledModal';
import Button from 'components/Button';
import FormField from 'components/FormField';
import Form from 'components/Form';
import { confirm, confirmPin } from 'lib/dialog';
import { callAPI, Token } from 'lib/api';
import { accountsQuery, tokensQuery } from 'lib/user';
import { showNotification } from 'lib/ui';
import { createLocalNameFee } from 'lib/fees';
import { formSubmit, required } from 'lib/form';
import UT from 'lib/usageTracking';
import memoize from 'utils/memoize';
import { SuggestionType } from './AutoSuggest';

__ = __context('NewAccount');

const getSuggestions = memoize((userTokens: Token[] | undefined) => [
  'NXS',
  ...(userTokens ? userTokens.map((t) => t.ticker || t.address) : []),
]);

async function createAccount({ name, token }: { name: string; token: string }) {
  if (!name) {
    const confirmed = await confirm({
      question: __('Create an account without a name?'),
      note: __('Adding a name costs a NXS fee'),
      labelYes: __("That's Ok"),
      labelNo: __('Cancel'),
    });
    if (!confirmed) return undefined;
  }
  const pin = await confirmPin();
  if (pin) {
    if (token === 'NXS') {
      return await callAPI('finance/create/account', { pin, name });
    } else {
      // Token accepts Name or Address
      try {
        return await callAPI('tokens/create/account', { pin, token });
      } catch (err) {
        // TODO: check error code?
        throw new Error(__(`Unknown token name/address: ${token}`));
      }
    }
  }
  return undefined;
}

export default function NewAccountModal({
  tokenName,
  tokenAddress,
}: {
  tokenName?: string;
  tokenAddress?: string;
}) {
  const tokens = tokensQuery.use();
  const tokenPreset = !!(tokenName || tokenAddress);
  const suggestions = tokenPreset ? [] : getSuggestions(tokens);
  const selectTokenProps = {
    name: 'token',
    validate: required(),
    suggestions: suggestions,
    filterSuggestions: (suggestions: SuggestionType[]) => suggestions,
    disabled: tokenPreset,
    className: tokenPreset ? 'dim' : undefined,
  };

  const initialValues = {
    name: '',
    token: tokenName || tokenAddress || 'NXS',
  };

  return (
    <ControlledModal maxWidth={700}>
      {(closeModal) => (
        <>
          <ControlledModal.Header>{__('New account')}</ControlledModal.Header>
          <ControlledModal.Body>
            <Form
              name="new_account"
              initialValues={initialValues}
              onSubmit={formSubmit({
                submit: createAccount,
                onSuccess: (result, values) => {
                  if (!result) return; // Submission was cancelled
                  UT.CreateNewItem('account');
                  accountsQuery.refetch();
                  closeModal();
                  showNotification(
                    __('New account %{account} has been created', {
                      account: values.name,
                    }),
                    'success'
                  );
                },
                errorMessage: __('Error creating account'),
              })}
              render={({ form }) => (
                <>
                  <FormField
                    connectLabel
                    label={__('Account name (Optional)', {
                      nameFee: createLocalNameFee,
                    })}
                  >
                    <Form.TextField
                      name="name"
                      placeholder={__("New account's name")}
                    />
                  </FormField>

                  <Form.Field
                    name="name"
                    component={({ input }) =>
                      !!input.value && (
                        <div className="mt1">
                          <span>
                            {__('Fee: %{nameFee} NXS', {
                              nameFee: createLocalNameFee,
                            })}
                          </span>
                        </div>
                      )
                    }
                  />

                  <div className="mt2">
                    <FormField connectLabel label={__('Token name/address')}>
                      {tokenPreset ? (
                        <Form.TextField {...selectTokenProps} />
                      ) : (
                        <Form.AutoSuggest
                          {...selectTokenProps}
                          onSelect={(suggestion) =>
                            form.change('token', suggestion)
                          }
                        />
                      )}
                    </FormField>
                  </div>

                  <div className="mt3 flex space-between">
                    <Button onClick={closeModal}>{__('Cancel')}</Button>
                    <Form.SubmitButton skin="primary">
                      {({ submitting }) =>
                        submitting
                          ? __('Creating account') + '...'
                          : __('Create account')
                      }
                    </Form.SubmitButton>
                  </div>
                </>
              )}
            />
          </ControlledModal.Body>
        </>
      )}
    </ControlledModal>
  );
}
