import { useSelector } from 'react-redux';

import ControlledModal from 'components/ControlledModal';
import Button from 'components/Button';
import FormField from 'components/FormField';
import Form from 'components/Form';
import { confirm, confirmPin } from 'lib/dialog';
import { callApi } from 'lib/tritiumApi';
import { loadAccounts } from 'lib/user';
import { showNotification } from 'lib/ui';
import { createLocalNameFee } from 'lib/fees';
import { formSubmit } from 'lib/form';
import GA from 'lib/googleAnalytics';
import memoize from 'utils/memoize';
import { addressRegex } from 'consts/misc';

__ = __context('NewAccount');

const getSuggestions = memoize((userTokens) => [
  'NXS',
  ...(userTokens ? userTokens.map((t) => t.name || t.address) : []),
]);

export default function NewAccountModal({ tokenName, tokenAddress }) {
  const suggestions = useSelector((state) =>
    tokenName || tokenAddress ? [] : getSuggestions(state.user.tokens)
  );

  const tokenPreset = !!(tokenName || tokenAddress);
  const SelectToken = tokenPreset ? Form.TextField : Form.AutoSuggest;

  return (
    <ControlledModal maxWidth={700}>
      {(closeModal) => {
        const formOptions = {
          name: 'new_account',
          initialValues: {
            name: '',
            token: tokenName || tokenAddress || 'NXS',
          },
          validate: ({ token }) => {
            const errors = {};
            if (!token) {
              errors.token = __('Token name/address is required');
            }
            return errors;
          },
          onSubmit: formSubmit({
            submit: async ({ name, token }) => {
              if (!name) {
                const confirmed = await confirm({
                  question: __('Create an account without a name?'),
                  note: __('Adding a name costs a NXS fee'),
                  labelYes: __("That's Ok"),
                  labelNo: __('Cancel'),
                });
                if (!confirmed) return;
              }
              const pin = await confirmPin();
              if (pin) {
                const params = { pin };
                if (name) params.name = name;

                if (token === 'NXS') {
                  return await callApi('finance/create/account', params);
                } else {
                  if (addressRegex.test(token)) {
                    try {
                      // Test if `token` is the token address
                      params.token = token;
                      return await callApi('tokens/create/account', params);
                    } catch (err) {}
                  }

                  // Assuming `token` is token name
                  try {
                    params.token_name = token;
                    return await callApi('tokens/create/account', params);
                  } catch (err) {
                    // TODO: check error code?
                    throw new Error(__('Unknown token name/address'));
                  }
                }
              }
            },
            onSuccess: (result) => {
              if (!result) return; // Submission was cancelled
              GA.SendEvent('Users', 'NewAccount', 'Accounts', 1);
              loadAccounts();
              closeModal();
              showNotification(
                __('New account %{account} has been created', {
                  account: props.values.name,
                }),
                'success'
              );
            },
            errorMessage: __('Error creating account'),
          }),
        };

        return (
          <>
            <ControlledModal.Header>{__('New account')}</ControlledModal.Header>
            <ControlledModal.Body>
              <Form {...formOptions}>
                {({ form }) => (
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
                        <SelectToken
                          name="token"
                          suggestions={suggestions}
                          filterSuggestions={(suggestions) => suggestions}
                          disabled={tokenPreset}
                          className={tokenPreset ? 'dim' : undefined}
                          onSelect={
                            tokenPreset
                              ? undefined
                              : (suggestion) => form.change('token', suggestion)
                          }
                        />
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
              </Form>
            </ControlledModal.Body>
          </>
        );
      }}
    </ControlledModal>
  );
}
