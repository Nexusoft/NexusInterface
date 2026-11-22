import { useSelector } from 'react-redux';
import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';
import { fade } from 'utils/color';

import ControlledModal from 'components/ControlledModal';
import Button from 'components/Button';
import FormField from 'components/FormField';
import Form from 'components/Form';
import { confirm, confirmPin } from 'lib/dialog';
import { callAPI } from 'lib/api';
import { refreshAccounts } from 'lib/user';
import { showNotification } from 'lib/ui';
import { createLocalNameFee } from 'lib/fees';
import { formSubmit, required } from 'lib/form';
import UT from 'lib/usageTracking';
import memoize from 'utils/memoize';

__ = __context('NewAccount');

const AccountModal = styled(ControlledModal)(({ theme }) => theme.modern && ({
  '.account-intro': { margin: '0 0 24px', fontSize: 14, lineHeight: 1.7, color: theme.mixer(0.7) },
  '.account-input': {
    minHeight: 48, borderRadius: 10,
    border: `1px solid ${fade(theme.primary, 0.75)}`,
    background: fade(theme.foreground, 0.96),
    '&:focus-within': { borderColor: theme.primary, boxShadow: `0 0 0 3px ${fade(theme.primary, 0.9)}` },
  },
  '.account-hint': { margin: '8px 0 0', fontSize: 12, lineHeight: 1.6, color: theme.mixer(0.6) },
  '.account-fee': { padding: '10px 14px', borderRadius: 8, background: fade(theme.primary, 0.92), color: theme.primary, fontSize: 12 },
  '.account-actions': {
    marginTop: 28, paddingTop: 20, borderTop: `1px solid ${fade(theme.primary, 0.85)}`,
    justifyContent: 'flex-end', gap: 12,
    'button': { minHeight: 44, height: 'auto', padding: '10px 20px' },
    '@media (max-width: 480px)': { flexDirection: 'column-reverse', 'button': { width: '100%' } },
  },
}));

const getSuggestions = memoize((userTokens) => [
  'NXS',
  ...(userTokens ? userTokens.map((t) => t.name || t.address) : []),
]);

async function createToken({ name, token }) {
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
      return await callAPI('finance/create/account', params);
    } else {
      // Token accepts Name or Address
      try {
        params.token = token;
        return await callAPI('tokens/create/account', params);
      } catch (err) {
        // TODO: check error code?
        throw new Error(__('Unknown token name/address'));
      }
    }
  }
}

export default function NewAccountModal({ tokenName, tokenAddress }) {
  const { modern } = useTheme();
  const suggestions = useSelector((state) =>
    tokenName || tokenAddress ? [] : getSuggestions(state.user.tokens)
  );

  const tokenPreset = !!(tokenName || tokenAddress);
  const SelectToken = tokenPreset ? Form.TextField : Form.AutoSuggest;

  return (
    <AccountModal maxWidth={modern ? 580 : 700}>
      {(closeModal) => (
        <>
          <ControlledModal.Header>{__('New account')}</ControlledModal.Header>
          <ControlledModal.Body>
            {modern && <p className="account-intro">{__('Create a separate account for NXS or a token. Add an optional name to make it easier to recognize.')}</p>}
            <Form
              name="new_account"
              initialValues={{
                name: '',
                token: tokenName || tokenAddress || 'NXS',
              }}
              onSubmit={formSubmit({
                submit: createToken,
                onSuccess: (result, values) => {
                  if (!result) return; // Submission was cancelled
                  UT.CreateNewItem('account');
                  refreshAccounts();
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
            >
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
                      skin={modern ? 'filled-inverted' : undefined}
                      className={modern ? 'account-input' : undefined}
                      placeholder={__("New account's name")}
                    />
                  </FormField>
                  {modern && <p className="account-hint">{__('Leave the name blank to create an unnamed account. Adding a name costs a NXS fee.')}</p>}

                  <Form.Field
                    name="name"
                    component={({ input }) =>
                      !!input.value && (
                        <div className={modern ? 'mt1 account-fee' : 'mt1'}>
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
                        {...(modern ? tokenPreset
                          ? { skin: 'filled-inverted' }
                          : { inputProps: { skin: 'filled-inverted', className: 'account-input' } }
                          : {})}
                        validate={required()}
                        suggestions={suggestions}
                        filterSuggestions={(suggestions) => suggestions}
                        disabled={tokenPreset}
                        className={tokenPreset ? (modern ? 'dim account-input' : 'dim') : undefined}
                        onSelect={
                          tokenPreset
                            ? undefined
                            : (suggestion) => form.change('token', suggestion)
                        }
                      />
                    </FormField>
                    {modern && <p className="account-hint">{tokenPreset ? __('The token is selected for this account.') : __('Choose NXS, select one of your tokens, or enter a token name or address.')}</p>}
                  </div>

                  <div className={modern ? 'account-actions flex' : 'mt3 flex space-between'}>
                    <Button type="button" onClick={closeModal}>{__('Cancel')}</Button>
                    <Form.SubmitButton skin={modern ? 'filled-primary' : 'primary'}>
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
      )}
    </AccountModal>
  );
}
