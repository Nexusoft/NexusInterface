import RegistryModalHeader from '../RegistryModalHeader';
import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';
import { fade } from 'utils/color';

import Form from 'components/Form';
import ControlledModal from 'components/ControlledModal';
import Button from 'components/Button';
import FormField from 'components/FormField';
import { formSubmit, checkAll, useFieldValue } from 'lib/form';
import { confirm, confirmPin } from 'lib/dialog';
import { callAPI } from 'lib/api';
import { refreshAccounts, refreshOwnedTokens } from 'lib/user';
import { openModal, showNotification } from 'lib/ui';
import NewAccountModal from 'components/NewAccountModal';

import { createTokenFee, createLocalNameFee } from 'lib/fees';
import UT from 'lib/usageTracking';

__ = __context('User.Tokens.NewToken');

const TokenModal = styled(ControlledModal)(({ theme }) => theme.modern && ({
  '.token-section': { padding: 18, border: `1px solid ${fade(theme.primary, 0.84)}`, borderRadius: 14, background: fade(theme.primary, 0.98), marginBottom: 16 },
  '.token-section h3': { margin: '0 0 14px', fontSize: 14, fontWeight: 500, color: theme.foreground },
  '.token-section [data-form-field]': { marginTop: 0 },
  '.token-summary': { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '16px 18px', borderRadius: 12, border: `1px solid ${fade(theme.primary, 0.78)}`, background: fade(theme.primary, 0.93) },
  '.token-summary-label': { fontSize: 12, color: theme.mixer(0.75) },
  '.token-summary p': { margin: '4px 0 0', fontSize: 11, color: theme.mixer(0.6), lineHeight: 1.6 },
  '.token-summary strong': { fontSize: 22, fontWeight: 500, color: theme.primary, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' },
  '.token-summary small': { fontSize: 12 },
  '.token-intro': { margin: '0 0 20px', fontSize: 13, lineHeight: 1.7, color: theme.mixer(0.7) },
  '.token-fee': { padding: '14px 16px', marginBottom: 22, borderRadius: 12, border: `1px solid ${fade(theme.primary, 0.8)}`, background: fade(theme.primary, 0.94), fontSize: 13, lineHeight: 1.6 },
  '.token-fee-title': { display: 'block', marginBottom: 6, fontSize: 11, letterSpacing: '.7px', color: theme.primary, textTransform: 'uppercase' },
  '.token-fee-note': { margin: '6px 0 0', color: theme.mixer(0.65), fontSize: 12 },
  '.token-input': { minHeight: 46, borderRadius: 10, border: `1px solid ${fade(theme.primary, 0.75)}`, background: fade(theme.foreground, 0.96), '&:focus-within': { borderColor: theme.primary, boxShadow: `0 0 0 3px ${fade(theme.primary, 0.9)}` } },
  '.token-input input': { fontSize: 14 },
  '.token-grid': { display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: 18, marginTop: 0 },
  '.token-grid > div': { minWidth: 0 },
  '.token-hint': { margin: '8px 0 0', fontSize: 12, lineHeight: 1.6, color: theme.mixer(0.6) },
  '.token-actions': { display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 28, paddingTop: 20, borderTop: `1px solid ${fade(theme.primary, 0.85)}`, button: { minHeight: 44, height: 'auto', padding: '10px 20px', borderRadius: 10 } },
  'button:focus-visible': { outline: `2px solid ${theme.primary}`, outlineOffset: 3 },
  '@media (max-width: 480px)': { '.token-grid': { gridTemplateColumns: 'minmax(0, 1fr)', gap: 0 }, '.token-actions': { flexDirection: 'column-reverse', button: { width: '100%' } } },
}));

function FeeSummary() {
  const supply = useFieldValue('supply');
  const decimals = useFieldValue('decimals');
  const name = useFieldValue('name');
  const creationFee = createTokenFee(supply, decimals);
  const namingFee = name ? createLocalNameFee : 0;
  const total = creationFee + namingFee;
  return <div className="token-summary" aria-live="polite">
    <div><span className="token-summary-label">{__('Estimated fee')}</span><p>{__('Creation: %{fee} NXS', { fee: creationFee })}{name ? ` + ${__('Name: %{fee} NXS', { fee: namingFee })}` : ''}</p></div>
    <strong>{Number.isFinite(total) ? total : '?'} <small>NXS</small></strong>
  </div>;
}

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
  const { modern } = useTheme();
  return (
    <TokenModal maxWidth={modern ? 640 : 400}>
      {(closeModal) => (
        <>
          <RegistryModalHeader section="Tokens">{__('New Token')}</RegistryModalHeader>
          <ControlledModal.Body>
            {modern && <p className="token-intro">{__("Set up your token's name, supply, and precision.")}</p>}
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
                  refreshOwnedTokens();
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

                  refreshAccounts();
                },
                errorMessage: __('Error creating token'),
              })}
            >
              {!modern && <FeeMessage />}
              <section className={modern ? 'token-section' : undefined}>
              {modern && <h3>{__('Token identity')}</h3>}
              <FormField connectLabel capitalizeLabel={!modern} label={__('Token name (optional)')}>
                  <Form.TextField
                    name="name"
                    skin={modern ? 'filled-inverted' : undefined}
                    className={modern ? 'token-input' : undefined}
                    placeholder={__('Enter a token name')}
                  />
              </FormField>
              <p className="token-hint">{__('Leave blank to create an unnamed token. Naming fee: %{fee} NXS.', { fee: createLocalNameFee })}</p>
              </section>
              <section className={modern ? 'token-section' : undefined}>
              {modern && <h3>{__('Supply & precision')}</h3>}
              <div className={modern ? 'token-grid' : undefined}>
                <div>
              <FormField connectLabel capitalizeLabel={!modern} label={__('Supply')}>
                  <Form.TextField
                    name="supply"
                    skin={modern ? 'filled-inverted' : undefined}
                    className={modern ? 'token-input' : undefined}
                    type="number"
                    min={1}
                    placeholder={'10000'}
                    validate={checkAll(isInteger, positiveNumber)}
                  />
              </FormField>
              <p className="token-hint">{__('Maximum number of tokens available.')}</p>
                </div>
                <div>
              <FormField connectLabel capitalizeLabel={!modern} label={__('Decimal places')}>
                  <Form.TextField name="decimals" placeholder={'4'} skin={modern ? 'filled-inverted' : undefined} className={modern ? 'token-input' : undefined} />
              </FormField>
              <p className="token-hint">{__('Digits allowed after the decimal point.')}</p>
                </div>
              </div>

              </section>
              {modern && <FeeSummary />}

              <div className={modern ? 'token-actions' : 'mt3 flex space-between'}>
                <Button skin="primary"
                  type="button"
                  onClick={() => {
                    closeModal();
                  }}
                >
                  {__('Cancel')}
                </Button>
                <Form.SubmitButton skin={modern ? "filled-primary" : "primary"}>
                  {__('Create token')}
                </Form.SubmitButton>
              </div>
            </Form>
          </ControlledModal.Body>
        </>
      )}
    </TokenModal>
  );
}
