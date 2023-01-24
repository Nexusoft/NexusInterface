import { useState, useEffect, useMemo, Fragment } from 'react';
import styled from '@emotion/styled';

import ControlledModal from 'components/ControlledModal';
import NexusAddress from 'components/NexusAddress';
import Icon from 'components/Icon';
import TokenName from 'components/TokenName';
import Tooltip from 'components/Tooltip';
import Form from 'components/Form';
import { callApi } from 'lib/tritiumApi';
import { lookupAddress } from 'lib/addressBook';
import { openSuccessDialog } from 'lib/dialog';
import { loadAccounts } from 'lib/user';
import { formSubmit, required } from 'lib/form';
import { timeToText } from 'utils/misc';
import addressBookIcon from 'icons/address-book.svg';
import WarningIcon from 'icons/warning.svg';
import sendIcon from 'icons/send.svg';

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

function NameTo({ name }) {
  const [address, setAddress] = useState(null);
  useEffect(() => {
    (async () => {
      const nameRecord = await callApi('finance/get/any', {
        //Uses new "any" to resolve any name type to address
        name: name.startsWith('local:') ? name.substring(6) : name, //TODO: Finance is having issues with ~, core needs to be accept it or we remove the ~ on get/accounts
      });
      setAddress(nameRecord?.address);
    })();
  }, []);
  return (
    <NexusAddress
      label={<RecipientName>{name}</RecipientName>}
      address={address || ''}
    />
  );
}

function AddressTo({ address }) {
  const contactName = useMemo(() => {
    const contact = lookupAddress(address);
    if (!contact) return null;
    return contact.name + (contact.label ? ' - ' + contact.label : '');
  }, [address]);
  return (
    <NexusAddress
      address={address}
      label={
        !!contactName && (
          <span>
            <Icon icon={addressBookIcon} />
            <span className="ml0_4 v-align">{contactName}</span>
          </span>
        )
      }
    />
  );
}

function TransactionDetails({ source, recipients }) {
  return (
    <Layout>
      <LabelCell>
        <Label>{__('From')}</Label>
      </LabelCell>
      <ContentCell>
        <Source source={source} />
      </ContentCell>

      {recipients.map(
        ({ name_to, address_to, amount, reference, expires }, i) => (
          <Fragment key={i}>
            <Separator />

            <LabelCell>
              <Label>{__('To')}</Label>
            </LabelCell>
            <ContentCell>
              <ContentCell>
                {name_to && <NameTo name={name_to} />}
                {address_to && <AddressTo address={address_to} />}
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

            {!!reference && (
              <>
                <LabelCell>
                  <Label>{__('Reference')}</Label>
                </LabelCell>
                <ContentCell>
                  <ContentCell>{reference}</ContentCell>
                </ContentCell>
              </>
            )}

            {(!!expires || expires === 0) && (
              <>
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
          </Fragment>
        )
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
            <TransactionDetails source={source} recipients={recipients} />
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
                  };

                  if (source?.token) {
                    params.from = source.token.address;
                    return await callApi('finance/debit/token', params);
                  } else {
                    params.from = source.account.address;
                    return await callApi('finance/debit/any', params);
                  }
                },
                onSuccess: () => {
                  resetSendForm();
                  loadAccounts();
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
