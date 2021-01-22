import { useState, useEffect, useMemo } from 'react';
import styled from '@emotion/styled';

import Modal from 'components/Modal';
import NexusAddress from 'components/NexusAddress';
import Tooltip from 'components/Tooltip';
import Icon from 'components/Icon';
import TokenName from 'components/TokenName';
import Button from 'components/Button';
import { callApi } from 'lib/tritiumApi';
import { lookupAddress } from 'lib/addressBook';
import addressBookIcon from 'icons/address-book.svg';
import sendIcon from 'icons/send.svg';

__ = __context('PreviewTransaction');

const Layout = styled.div({
  display: 'grid',
  gridTemplateColumns: 'max-content 1fr',
  columnGap: '1em',
  rowGap: '1em',
});

const LabelCell = styled.div({
  gridColumn: '1 / span 1',
});

const ContentCell = styled.div({
  gridColumn: '2 / span 1',
});

const Title = styled.div(({ theme }) => ({
  fontSize: 22,
  color: theme.mixer(0.75),
}));

const Label = styled.div({
  textTransform: 'uppercase',
});

const SourceName = styled.span(({ theme }) => ({
  fontWeight: 'bold',
  color: theme.foreground,
}));

const UnNamed = styled(SourceName)(({ theme }) => ({
  fontStyle: 'italic',
  color: theme.mixer(0.8),
}));

function Source({ source }) {
  const { name, address } = source?.account || source?.token || {};
  return (
    <div>
      <div>
        {name ? (
          <SourceName>{name}</SourceName>
        ) : (
          <UnNamed>{__('Unnamed')}</UnNamed>
        )}
      </div>
      <NexusAddress address={address} />
    </div>
  );
}

function NameTo({ name }) {
  const [address, setAddress] = useState(null);
  useEffect(() => {
    (async () => {
      const nameRecord = await callApi('names/get/name', { name });
      setAddress(nameRecord?.register_address);
    })();
  }, []);
  return (
    <Tooltip.Trigger tooltip={!!address && <NexusAddress address={address} />}>
      <span>{name}</span>
    </Tooltip.Trigger>
  );
}

function AddressTo({ address }) {
  const contactName = useMemo(() => {
    const contact = lookupAddress(address);
    if (!contact) return null;
    return [contact.name, contact.label || ''].join(' - ');
  }, [address]);
  return (
    <Tooltip.Trigger
      tooltip={
        !!contactName && (
          <span>
            <Icon icon={addressBookIcon} />
            <span className="ml0_4 v-align">{contactName}</span>
          </span>
        )
      }
    >
      <span>{address}</span>
    </Tooltip.Trigger>
  );
}

function renderExpiry(timeSpan) {
  let string = '';
  let remainder = timeSpan;

  const days = Math.floor(remainder / 86400);
  if (days) {
    string += __('%{smart_count} day |||| %{smart_count} days', days) + ' ';
  }
  remainder %= 86400;

  const hours = Math.floor(remainder / 3600);
  if (hours) {
    string += __('%{smart_count} hour |||| %{smart_count} hours', hours) + ' ';
  }
  remainder %= 3600;

  const minutes = Math.floor(remainder / 60);
  if (minutes) {
    string +=
      __('%{smart_count} minute |||| %{smart_count} minutes', minutes) + ' ';
  }

  const seconds = remainder % 60;
  if (seconds) {
    string +=
      __('%{smart_count} second |||| %{smart_count} seconds', seconds) + ' ';
  }

  string += `(${__(
    '%{smart_count} second |||| %{smart_count} seconds',
    timeSpan
  )})`;
  return string;
}

export default function PreviewTransactionModal({ source, recipients }) {
  return (
    <Modal>
      <Modal.Header>{__('Preview Transaction')}</Modal.Header>
      <Modal.Body>
        <Layout>
          <ContentCell>
            <Title>{__("You're sending")}</Title>
          </ContentCell>

          <LabelCell>
            <Label>{__('From')}</Label>
          </LabelCell>
          <ContentCell>
            <Source source={source} />
          </ContentCell>

          {recipients.map(
            ({ name_to, address_to, amount, reference, expires }) => (
              <>
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
                    {amount}{' '}
                    <TokenName
                      account={source?.account}
                      token={source?.token}
                    />
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

                {!!expires && (
                  <>
                    <LabelCell>
                      <Label>{__('Expires')}</Label>
                    </LabelCell>
                    <ContentCell>
                      <ContentCell>{renderExpiry(expires)}</ContentCell>
                    </ContentCell>
                  </>
                )}
              </>
            )
          )}
        </Layout>
      </Modal.Body>

      <Modal.Footer>
        <Button skin="primary" uppercase wide>
          <Icon icon={sendIcon} />
          <span className="ml0_4 v-align">{__('Send transaction')}</span>
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
