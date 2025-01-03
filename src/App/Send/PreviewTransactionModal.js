import { Fragment } from 'react';
import styled from '@emotion/styled';

import ControlledModal from 'components/ControlledModal';
import NexusAddress from 'components/NexusAddress';
import Icon from 'components/Icon';
import TokenName from 'components/TokenName';
import Tooltip from 'components/Tooltip';
import Form from 'components/Form';
import { callAPI } from 'lib/api';
import { refetchCoreInfo } from 'lib/coreInfo';
import { openSuccessDialog } from 'lib/dialog';
import { accountsQuery } from 'lib/user';
import { refetchTransactions } from 'lib/transactions';
import { formSubmit, required } from 'lib/form';
import { timeToText } from 'utils/misc';
import WarningIcon from 'icons/warning.svg';
import sendIcon from 'icons/send.svg';

import RecipientAddress from './RecipientAddress';
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

function Source({ source }) {
  const { name, address } = source?.account || source?.token || {};
  const { ticker } = source?.token || {}; //Only get ticker if the source is a token.
  return (
    <NexusAddress
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
  return (
    <ControlledModal>
      {(closeModal) => (
        <>
          <ControlledModal.Header>
            {__("You're sending")}
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
                  accountsQuery.refetch();
                  refetchCoreInfo();
                  refetchTransactions();
                  closeModal();
                  openSuccessDialog({
                    message: __('Transaction sent'),
                  });
                },
                errorMessage: __('Error sending transaction'),
              })}
            >
              <div style={{ marginTop: -20 }}>
                <Form.TextFieldWithKeyboard
                  name="pin"
                  validate={required()}
                  maskable
                  autoFocus
                  skin="filled-inverted"
                  placeholder={__('Enter your PIN to confirm')}
                />

                <SubmitButton skin="primary" uppercase wide className="mt1">
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
              </div>
            </Form>
          </ControlledModal.Footer>
        </>
      )}
    </ControlledModal>
  );
}
