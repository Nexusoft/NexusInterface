import { moduleLayout, modulePanel } from 'utils/moduleStyles';
// External
import { useEffect, useId } from 'react';
import { useSelector } from 'react-redux';
import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';
import arrayMutators from 'final-form-arrays';

// Internal Global
import Form from 'components/Form';
import Icon from 'components/Icon';
import Button from 'components/Button';
import FormField from 'components/FormField';
import { openModal } from 'lib/ui';
import { refreshAccounts, refreshOwnedTokens } from 'lib/user';
import {
  formName,
  getDefaultRecipient,
  useInitialValues,
  getSource,
} from 'lib/send';
import { required } from 'lib/form';
import store from 'store';
import { timing } from 'styles';
import sendIcon from 'icons/send.svg';
import plusIcon from 'icons/plus.svg';

// Internal Local
import Recipients from './Recipients';
import ExpiryFields from './ExpiryFields';
import { selectAccountOptions } from './selectors';
import PreviewTransactionModal from './PreviewTransactionModal';
import ModernSendFields from './ModernSendFields';
import { fade, mix, luminosity } from 'utils/color';

__ = __context('Send');

const SendFormComponent = styled.div(({ theme }) => ({
  maxWidth: 900,
  margin: '-.5em auto 0',
  ...(theme.modern && {
    flex: '1 0 auto',
    display: 'flex', flexDirection: 'column',
    containerType: 'inline-size', containerName: 'send-layout', minWidth: 0,
    '> form': { display: 'flex', flexDirection: 'column', flex: '1 0 auto' },
    maxWidth: 'none', width: '100%', boxSizing: 'border-box', margin: '0 auto', padding: 0,
    'label': { fontSize: 12, letterSpacing: '0.2px', color: theme.mixer(0.75), marginBottom: 8, textTransform: 'none' },
    'input, textarea': { fontSize: 14 },
    'input:focus-visible, textarea:focus-visible, button:focus-visible': { outline: `2px solid ${theme.primary}`, outlineOffset: 3 },
    '@media (max-width: 600px)': { padding: 0 },
  }),
}));

const FormIntro = styled.div(({ theme }) => ({
  display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28,
  paddingBottom: 24, borderBottom: `1px solid ${fade(theme.primary, 0.88)}`,
  '.send-symbol': { display: 'grid', placeItems: 'center', width: 48, height: 48, flexShrink: 0, borderRadius: 14, color: theme.primary, background: fade(theme.primary, 0.9) },
  h1: { margin: 0, fontSize: 24, fontWeight: 500, letterSpacing: '-0.5px' },
  p: { margin: '6px 0 0', fontSize: 13, lineHeight: 1.6, color: theme.mixer(0.65) },
}));

const SectionHeading = styled.div(({ theme }) => ({
  display: 'flex', alignItems: 'center', gap: 10, marginTop: 24,
  fontSize: 14, fontWeight: 500,
  span: { display: 'grid', placeItems: 'center', width: 24, height: 24, borderRadius: '50%', fontSize: 11, color: theme.primary, background: fade(theme.primary, 0.9) },
}));

const Options = styled.div(({ theme }) => (theme.modern ? {
  marginTop: 24, padding: '16px 0', borderTop: `1px solid ${fade(theme.primary, 0.88)}`,
  '> div:first-of-type': { justifyContent: 'flex-start' },
  label: { marginBottom: 0 },
  '.advanced-hint': { margin: '8px 0 0', fontSize: 12, color: theme.mixer(0.6), lineHeight: 1.5 },
} : {}));

const ReviewHint = styled.p(({ theme }) => ({
  margin: '16px 0 0', textAlign: 'right', fontSize: 12, lineHeight: 1.6, color: theme.mixer(0.6),
}));

const SourceField = styled(FormField)(({ theme }) => (
  theme.modern ? { width: '100%', maxWidth: 480 } : {}
));

const SendFormButtons = styled.div(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: '3em',
  ...(theme.modern && {
    marginTop: 28, paddingTop: 20, borderTop: `1px solid ${fade(theme.primary, 0.85)}`,
    justifyContent: 'flex-end', gap: 12, flexWrap: 'wrap',
    '> button': { flex: '0 1 auto', marginRight: 0, minHeight: 46, height: 'auto', padding: '12px 20px', borderRadius: 10, whiteSpace: 'normal' },
    '@media (max-width: 600px)': { '> button': { flex: '1 1 100%' } },
  }),
}));

const SendBtn = styled(Form.SubmitButton)(({ theme }) => ({
  flex: 1,
  ...(theme.modern && { fontWeight: 600,
    '&&, &&:hover, &&:active, &&:disabled': {
      background: theme.primary,
      color: luminosity(theme.primary) > 0.179 ? '#000000' : '#ffffff',
      textShadow: 'none',
    },
  }),
}));

const MultiBtn = styled(Button)({
  marginRight: 0,
});

const AdvancedOptionsSwitch = styled.div({
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  marginTop: 10,
  fontSize: 15,
});

const AdvancedOptionsLabel = styled.label(({ active }) => ({
  transition: `opacity ${timing.normal}`,
  opacity: active ? 1 : 0.67,
}));

function getRecipientsParams({ recipients, advancedOptions }) {
  return recipients.map(({ address, amount, reference }) => ({
    address_to: address,
    amount: parseFloat(amount),
    reference: (!!advancedOptions && reference) || undefined,
  }));
}

function getAdvancedParams({ expiry, advancedOptions }) {
  const params = {};
  if (advancedOptions) {
    const expires =
      parseInt(expiry.expireSeconds) +
      parseInt(expiry.expireMinutes) * 60 +
      parseInt(expiry.expireHours) * 3600 +
      parseInt(expiry.expireDays) * 86400;
    if (Number.isInteger(expires) && expires > 0) {
      params.expires = expires;
    }
  }
  return params;
}

export default function SendForm() {
  const { modern } = useTheme();
  const switchID = useId();
  const accountOptions = useSelector(selectAccountOptions);
  const initialValues = useInitialValues();
  useEffect(() => {
    refreshAccounts();
    refreshOwnedTokens();
  }, []);

  return (
    <SendFormComponent>
      <Form
        name={formName}
        persistState
        initialValues={initialValues}
        initialValuesEqual={() => true}
        onSubmit={({ sendFrom, recipients, expiry, advancedOptions }, form) => {
          const state = store.getState();
          const source = getSource(state, sendFrom);
          openModal(PreviewTransactionModal, {
            source,
            recipients: getRecipientsParams({ recipients, advancedOptions }),
            ...getAdvancedParams({ expiry, advancedOptions }),
            resetSendForm: form.reset,
          });
        }}
        mutators={{ ...arrayMutators }}
      >
        {modern ? <ModernSendFields accountOptions={accountOptions} /> : <>
        {modern && <FormIntro>
          <div className="send-symbol"><Icon icon={sendIcon} /></div>
          <div><h1>{__('Send funds')}</h1><p>{__('Transfer to a Nexus name, address, or saved contact.')}</p></div>
        </FormIntro>}
        {modern && <SectionHeading><span>1</span>{__('Choose your source')}</SectionHeading>}
        <SourceField label={__('Send from')}>
          <Form.Select
            name="sendFrom"
            skin="filled-inverted"
            placeholder={__('Select an account')}
            options={accountOptions}
            validate={required()}
          />
        </SourceField>

        {modern && <SectionHeading><span>2</span>{__('Add recipients and amounts')}</SectionHeading>}
        <Form.FieldArray component={Recipients} name="recipients" />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
          <Form.FieldArray
            name="recipients"
            render={({ fields }) => (
              <MultiBtn
                skin="default"
                onClick={() => fields.push(getDefaultRecipient())}
              >
                <Icon icon={plusIcon} style={{ fontSize: '.8em' }} />
                <span className="v-align ml0_4">{__('Add recipient')}</span>
              </MultiBtn>
            )}
          />
        </div>

        <Options>
        <div className="flex justify-end">
          <AdvancedOptionsSwitch>
            <Form.Switch
              name="advancedOptions"
              style={{ fontSize: '.75em' }}
              id={switchID}
            />
            <Form.Field
              name="advancedOptions"
              subscription={{ value: true }}
              render={({ input: { value } }) => (
                <AdvancedOptionsLabel
                  className="ml0_4 pointer"
                  htmlFor={switchID}
                  active={value}
                >
                  {__('Advanced options')}
                </AdvancedOptionsLabel>
              )}
            />
          </AdvancedOptionsSwitch>
        </div>

        {modern && <p className="advanced-hint">{__('Add payment references or set a transaction expiry.')}</p>}
        <ExpiryFields />
        </Options>

        <SendFormButtons>
          <SendBtn skin={modern ? 'filled-primary' : 'primary'}>
            <Icon icon={sendIcon} className="mr0_4" />
            {modern ? __('Review transaction') : __('Proceed')}
          </SendBtn>
        </SendFormButtons>
        {modern && <ReviewHint>{__('You’ll review the details before confirming your transfer.')}</ReviewHint>}
        </>}
      </Form>
    </SendFormComponent>
  );
}
