// External
import { useId } from 'react';
import styled from '@emotion/styled';
import arrayMutators from 'final-form-arrays';

// Internal Global
import Form from 'components/Form';
import Icon from 'components/Icon';
import Button from 'components/Button';
import FormField from 'components/FormField';
import { openModal } from 'lib/ui';
import { accountsQuery, tokensQuery } from 'lib/user';
import {
  formName,
  getDefaultRecipient,
  useInitialValues,
  getSource,
} from 'lib/send';
import { required } from 'lib/form';
import { timing } from 'styles';
import TokenName from 'components/TokenName';
import memoize from 'utils/memoize';
import shortenAddress from 'utils/shortenAddress';
import walletIcon from 'icons/wallet.svg';
import tokenIcon from 'icons/token.svg';
import sendIcon from 'icons/send.svg';
import plusIcon from 'icons/plus.svg';

// Internal Local
import Recipients from './Recipients';
import ExpiryFields from './ExpiryFields';
import PreviewTransactionModal from './PreviewTransactionModal';

__ = __context('Send');

const SendFormComponent = styled.div({
  maxWidth: 900,
  margin: '-.5em auto 0',
});

const SendFormButtons = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: '3em',
});

const SendBtn = styled(Form.SubmitButton)({
  flex: 1,
});

const MultiBtn = styled(Button)({
  marginRight: '1em',
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

const Separator = styled.div(({ theme }) => ({
  fontWeight: 'bold',
  color: theme.primary,
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

const getAccountOptions = memoize((accounts, userTokens) => {
  let options = [];

  if (accounts?.length) {
    options.push({
      value: 'AccountsSeparator',
      display: <Separator>{__('Accounts')}</Separator>,
      isSeparator: true,
      indent: false,
    });
    options.push(
      ...accounts.map((account) => ({
        value: `account:${account.address}`,
        display: (
          <span>
            <Icon icon={walletIcon} className="mr0_4" />
            <span className="v-align">
              {account.name ? (
                <span>{account.name}</span>
              ) : (
                <span>
                  <em className="semi-dim">{__('Unnamed account')}</em>{' '}
                  <span className="dim">{shortenAddress(account.address)}</span>
                </span>
              )}{' '}
              ({account.balance} {TokenName.from({ account })})
            </span>
          </span>
        ),
        indent: true,
      }))
    );
  }
  if (userTokens && userTokens.length > 0) {
    options.push({
      value: 'TokensSeparator',
      display: <Separator>{__('Tokens')}</Separator>,
      isSeparator: true,
      indent: false,
    });
    options.push(
      ...userTokens.map((token) => ({
        value: `token:${token.address}`,
        display: (
          <span>
            <Icon icon={tokenIcon} className="mr0_4" />
            <span className="v-align">
              {token.ticker || (
                <span>
                  <em>{__('Unnamed token')}</em>{' '}
                  <span className="dim">{shortenAddress(token.address)}</span>
                </span>
              )}{' '}
              ({token.balance} {TokenName.from({ token })})
            </span>
          </span>
        ),
        indent: true,
      }))
    );
  }

  return options;
});

export default function SendForm() {
  const switchID = useId();
  const initialValues = useInitialValues();
  const accounts = accountsQuery.use();
  const userTokens = tokensQuery.use();
  const accountOptions = getAccountOptions(accounts, userTokens);

  return (
    <SendFormComponent>
      <Form
        name={formName}
        persistState
        initialValues={initialValues}
        initialValuesEqual={() => true}
        onSubmit={({ sendFrom, recipients, expiry, advancedOptions }, form) => {
          const source = getSource(sendFrom, accounts, userTokens);
          openModal(PreviewTransactionModal, {
            source,
            recipients: getRecipientsParams({ recipients, advancedOptions }),
            ...getAdvancedParams({ expiry, advancedOptions }),
            resetSendForm: form.reset,
          });
        }}
        mutators={{ ...arrayMutators }}
      >
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

        <FormField label={__('Send from')}>
          <Form.Select
            name="sendFrom"
            skin="filled-inverted"
            placeholder={__('Select an account')}
            options={accountOptions}
            validate={required()}
          />
        </FormField>

        <Form.FieldArray component={Recipients} name="recipients" />

        <ExpiryFields />

        <SendFormButtons>
          <Form.FieldArray
            name="recipients"
            render={({ fields }) => (
              <MultiBtn
                skin="default"
                onClick={() => {
                  fields.push(getDefaultRecipient());
                }}
              >
                <Icon icon={plusIcon} style={{ fontSize: '.8em' }} />
                <span className="v-align ml0_4">{__('Add recipient')}</span>
              </MultiBtn>
            )}
          />
          <SendBtn skin="primary">
            <Icon icon={sendIcon} className="mr0_4" />
            {__('Proceed')}
          </SendBtn>
        </SendFormButtons>
      </Form>
    </SendFormComponent>
  );
}
