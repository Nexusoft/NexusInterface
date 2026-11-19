import styled from '@emotion/styled';

import ControlledModal from 'components/ControlledModal';
import Button from 'components/Button';
import InfoField from 'components/InfoField';
import CodeBlock from 'components/CodeBlock';
import NexusAddress from 'components/NexusAddress';
import ExplorerLink from 'components/ExplorerLink';
import TransactionDetailsModal from 'components/TransactionDetailsModal';
import { openModal } from 'lib/ui';
import { addressRegex } from 'consts/misc';
import { Contract } from 'lib/api';

__ = __context('ContractDetails');

const KeyName = styled.span({
  textTransform: 'capitalize',
});

const translateKey = (key: string) => {
  switch (key) {
    case 'id':
      return 'Contract #';
    case 'OP':
      return 'Operation';
    case 'txid':
      return 'Transaction ID';
    case 'ticker':
    case 'token_name':
      return 'Token Name';
    case 'from_name':
      return 'From Name';
    case 'json':
      return 'JSON';
    default:
      return <KeyName>{key}</KeyName>;
  }
};

function AddressValue({ address, label }: { address: string; label?: string }) {
  return (
    <div>
      <NexusAddress
        type="truncateMiddle"
        address={address}
        label={label}
        copyable
      />
      <ExplorerLink id={address} className="mt0_4" />
    </div>
  );
}

const registerLabel = (register: Record<string, any>) => {
  if (!register.name) return undefined;
  const prefix = register.namespace
    ? register.namespace + '::'
    : !register.global && register.user
    ? register.user + ':'
    : '';
  return prefix + register.name;
};

function displayValue(value: any, key: string) {
  if (value === null || value === undefined) return null;

  //from / to / recipient registers come as objects with an address
  if (
    typeof value === 'object' &&
    !Array.isArray(value) &&
    typeof value.address === 'string'
  ) {
    return <AddressValue address={value.address} label={registerLabel(value)} />;
  }

  if (typeof value === 'object') {
    return <CodeBlock>{JSON.stringify(value, null, 2)}</CodeBlock>;
  }

  if (typeof value === 'string' && addressRegex.test(value)) {
    return <AddressValue address={value} />;
  }

  if (key === 'txid' || key === 'destination') {
    return <AddressValue address={String(value)} />;
  }

  return String(value);
}

export default function ContractDetailsModal({
  contract,
  txid,
}: {
  contract: Contract;
  txid: string;
}) {
  if (!contract) return;

  return (
    <ControlledModal>
      {(closeModal) => (
        <>
          <ControlledModal.Header>
            {__('Contract Details')}
          </ControlledModal.Header>
          <ControlledModal.Body>
            {Object.entries(contract).map(([key, value]) => (
              <InfoField key={key} label={translateKey(key)}>
                {displayValue(value, key)}
              </InfoField>
            ))}
            <InfoField label="">
              <Button
                skin="hyperlink"
                onClick={() => {
                  closeModal();
                  openModal(TransactionDetailsModal, { txid });
                }}
              >
                {__('View transaction details')}
              </Button>
            </InfoField>
          </ControlledModal.Body>
        </>
      )}
    </ControlledModal>
  );
}
