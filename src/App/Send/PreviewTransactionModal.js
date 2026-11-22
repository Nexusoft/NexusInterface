import { Fragment } from 'react';
import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';
import { fade } from 'utils/color';

import ControlledModal from 'components/ControlledModal';
import NexusAddress from 'components/NexusAddress';
import Icon from 'components/Icon';
import TokenName from 'components/TokenName';
import Tooltip from 'components/Tooltip';
import Form from 'components/Form';
import { callAPI } from 'lib/api';
import { openSuccessDialog } from 'lib/dialog';
import { refreshAccounts } from 'lib/user';
import { formSubmit, required } from 'lib/form';
import { timeToText } from 'utils/misc';
import WarningIcon from 'icons/warning.svg';
import sendIcon from 'icons/send.svg';

import RecipientAddress from './RecipientAddress';
import { loadTransactions } from 'lib/transactions';
import UT from 'lib/usageTracking';

__ = __context('PreviewTransaction');

const Layout = styled.div({
  display: 'grid',
  gridTemplateColumns: 'max-content 1fr',
  columnGap: '1em',
  rowGap: '1em',
  paddingBottom: 20,
});

const LabelCell = styled.div({
  gridColumn: '1 / span 1',
  textAlign: 'left',
  display: 'flex',
  alignItems: 'center',
});

const ContentCell = styled.div({
  gridColumn: '2 / span 1',
});

const Label = styled.div(({ theme }) => ({
  textTransform: 'uppercase',
  fontSize: '0.9em',
  color: theme.mixer(0.625),
}));

const Content = styled.div(({ theme }) => ({
  color: theme.foreground,
}));

const SourceName = styled.span(({ theme }) => ({
  fontWeight: 'bold',
  color: theme.foreground,
}));

const UnNamed = styled(SourceName)(({ theme }) => ({
  fontStyle: 'italic',
  color: theme.mixer(0.8),
}));

const RecipientName = styled.span(({ theme }) => ({
  fontWeight: 'bold',
  color: theme.foreground,
}));

const Separator = styled.div(({ theme }) => ({
  gridColumn: '1 / span 2',
  height: 1,
  backgroundColor: theme.mixer(0.125),
}));

const SubmitButton = styled(Form.SubmitButton)({
  fontSize: 16,
});

const ReviewCards = styled.div(({ theme }) => ({
  display: 'grid', gap: 14, minWidth: 0,
  '.review-card': { padding: 18, borderRadius: 12, border: `1px solid ${fade(theme.primary, 0.8)}`, background: fade(theme.primary, 0.97), minWidth: 0 },
  h3: { margin: '0 0 12px', fontSize: 11, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: theme.primary },
  '.review-address': { minWidth: 0, fontSize: 13 },
  '.review-address > div': { background: 'transparent', border: 0, padding: '6px 0', textAlign: 'left', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', lineHeight: 1.6 },
  '.review-amount': { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginTop: 14, paddingTop: 14, borderTop: `1px solid ${fade(theme.primary, 0.85)}`, fontSize: 12, color: theme.mixer(0.7) },
  '.review-amount strong': { fontSize: 20, fontWeight: 500, color: theme.foreground, overflowWrap: 'anywhere' },
  '.review-meta': { fontSize: 12, color: theme.mixer(0.7), overflowWrap: 'anywhere', margin: '12px 0 0' },
}));

const Confirmation = styled.div(({ theme }) => theme.modern ? {
  marginTop: 0,
  '> label': { display: 'block', fontSize: 12, marginBottom: 8, color: theme.mixer(0.75) },
  '> div': { borderRadius: 9, minHeight: 42 },
  'input': { fontSize: 13, minWidth: 0 },
  '> button': { height: 42, borderRadius: 9, fontSize: 13, textTransform: 'none', marginTop: 16 },
} : { marginTop: -20 });

function Source({ source, ...rest }) {
  const { name, address } = source?.account || source?.token || {};
  const { ticker } = source?.token || {}; //Only get ticker if the source is a token.
  return (
    <NexusAddress
      {...rest}
      address={address}
      label={
        name || ticker ? (
          <SourceName>{name || ticker}</SourceName>
        ) : (
          <UnNamed>
            {source?.token ? __('Unnamed token') : __('Unnamed account')}
          </UnNamed>
        )
      }
    />
  );
}

function TransactionDetails({ source, recipients, reference, expires }) {
  const { modern } = useTheme();
  if (modern) return (
    <ReviewCards>
      <section className="review-card">
        <h3>{__('From')}</h3>
        <Source source={source} type="segmented" continuous className="review-address" />
      </section>
      {recipients.map(({ address_to, amount, reference: paymentReference }, i) => (
        <section className="review-card" key={i}>
          <h3>{__('To')}{recipients.length > 1 ? ` ${i + 1}` : ''}</h3>
          {address_to && <RecipientAddress address={address_to} type="segmented" continuous className="review-address" />}
          <div className="review-amount"><span>{__('Amount')}</span><strong>{amount} <TokenName account={source?.account} token={source?.token} /></strong></div>
          {paymentReference != null && <p className="review-meta">{__('Reference')}: {paymentReference}</p>}
        </section>
      ))}
      {expires != null && <p className="review-meta">{__('Expires')}: {expires === 0 ? <>{__('NO EXPIRY')} <Tooltip.Trigger tooltip={__("Transaction never expires, and you won't be able to void it even if the recipient doesn't credit the transaction")}><Icon icon={WarningIcon} /></Tooltip.Trigger></> : __('in %{time_span}', { time_span: timeToText(expires) })}</p>}
    </ReviewCards>
  );
  return (
    <Layout>
      <LabelCell>
        <Label>{__('From')}</Label>
      </LabelCell>
      <ContentCell>
        <Source source={source} />
      </ContentCell>

      {recipients.map(({ address_to, amount }, i) => (
        <Fragment key={i}>
          <Separator />

          <LabelCell>
            <Label>{__('To')}</Label>
          </LabelCell>
          <ContentCell>
            <ContentCell>
              {address_to && <RecipientAddress address={address_to} />}
            </ContentCell>
          </ContentCell>

          <LabelCell>
            <Label>{__('Amount')}</Label>
          </LabelCell>
          <ContentCell>
            <ContentCell>
              <Content>
                {amount}{' '}
                <TokenName account={source?.account} token={source?.token} />
              </Content>
            </ContentCell>
          </ContentCell>
        </Fragment>
      ))}

      {!!reference && (
        <>
          <Separator />
          <LabelCell>
            <Label>{__('Reference')}</Label>
          </LabelCell>
          <ContentCell>
            <ContentCell>{reference}</ContentCell>
          </ContentCell>
        </>
      )}

      {!!expires && (
        <>
          <Separator />
          <LabelCell>
            <Label>{__('Expires')}</Label>
          </LabelCell>
          <ContentCell>
            <ContentCell>
              {expires === 0 ? (
                <span>
                  <span className="v-align mr0_4">{__('NO EXPIRY')}</span>
                  <Tooltip.Trigger
                    tooltip={__(
                      "Transaction never expires, and you won't be able to void it even if the recipient doesn't credit the transaction"
                    )}
                  >
                    <Icon icon={WarningIcon} />
                  </Tooltip.Trigger>
                </span>
              ) : (
                __('in %{time_span}', {
                  time_span: timeToText(expires),
                })
              )}
            </ContentCell>
          </ContentCell>
        </>
      )}
    </Layout>
  );
}

const initialValues = {
  pin: '',
};

export default function PreviewTransactionModal({
  source,
  recipients,
  expires,
  resetSendForm,
}) {
  const { modern } = useTheme();
  return (
    <ControlledModal maxWidth={modern ? 640 : undefined}>
      {(closeModal) => (
        <>
          <ControlledModal.Header>
            {modern ? __('Review transaction') : __("You're sending")}
          </ControlledModal.Header>
          <ControlledModal.Body>
            <TransactionDetails
              source={source}
              recipients={recipients}
              expires={expires}
            />
          </ControlledModal.Body>

          <ControlledModal.Footer>
            <Form
              name="preview_tx"
              initialValues={initialValues}
              onSubmit={formSubmit({
                submit: async ({ pin }) => {
                  const params = {
                    pin,
                    recipients,
                    expires,
                  };

                  if (source?.token) {
                    params.from = source.token.address;
                    return await callAPI('finance/debit/token', params);
                  } else {
                    params.from = source.account.address;
                    return await callAPI('finance/debit/any', params);
                  }
                },
                onSuccess: () => {
                  UT.Send(source?.token ? 'token' : 'nexus');
                  resetSendForm();
                  refreshAccounts();
                  loadTransactions();
                  closeModal();
                  openSuccessDialog({
                    message: __('Transaction sent'),
                  });
                },
                errorMessage: __('Error sending transaction'),
              })}
            >
              <Confirmation>
                {modern && <label htmlFor="confirm-transfer-pin">{__('Confirm with your PIN')}</label>}
                <Form.TextFieldWithKeyboard
                  id="confirm-transfer-pin"
                  name="pin"
                  validate={required()}
                  maskable
                  autoFocus
                  skin="filled-inverted"
                  placeholder={__('Enter your PIN to confirm')}
                />

                <SubmitButton skin={modern ? 'filled-primary' : 'primary'} uppercase={!modern} wide className="mt1">
                  {({ submitting }) => (
                    <>
                      <Icon icon={sendIcon} />
                      <span className="ml0_4 v-align">
                        {submitting
                          ? __('Sending transaction...')
                          : __('Send transaction')}
                      </span>
                    </>
                  )}
                </SubmitButton>
              </Confirmation>
            </Form>
          </ControlledModal.Footer>
        </>
      )}
    </ControlledModal>
  );
}
