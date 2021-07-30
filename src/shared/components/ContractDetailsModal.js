import { Component } from 'react';
import styled from '@emotion/styled';

import Modal from 'components/Modal';
import Button from 'components/Button';
import InfoField from 'components/InfoField';
import CodeBlock from 'components/CodeBlock';
import TransactionDetailsModal from 'components/TransactionDetailsModal';
import { openModal } from 'lib/ui';
import { addressRegex } from 'consts/misc';

__ = __context('ContractDetails');

const KeyName = styled.span({
  textTransform: 'capitalize',
});

const translateKey = (key) => {
  switch (key) {
    case 'id':
      return 'Contract #';
    case 'OP':
      return 'Operation';
    case 'txid':
      return 'Transaction ID';
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

function displayValue(value) {
  if (value === null || value === undefined) return null;

  if (typeof value === 'object') {
    return <CodeBlock>{JSON.stringify(value, null, 2)}</CodeBlock>;
  }

  if (typeof value === 'string' && addressRegex.test(value)) {
    return <span className="monospace">{value}</span>;
  }

  return String(value);
}

class ContractDetailsModal extends Component {
  render() {
    const { contract, txid } = this.props;
    if (!contract) return;

    return (
      <Modal
        assignClose={(close) => {
          this.closeModal = close;
        }}
      >
        <Modal.Header>{__('Contract Details')}</Modal.Header>
        <Modal.Body>
          {Object.entries(contract).map(([key, value]) => (
            <InfoField key={key} label={translateKey(key)}>
              {displayValue(value)}
            </InfoField>
          ))}
          <InfoField label="">
            <Button
              skin="hyperlink"
              onClick={() => {
                this.closeModal();
                openModal(TransactionDetailsModal, { txid });
              }}
            >
              {__('View transaction details')}
            </Button>
          </InfoField>
        </Modal.Body>
      </Modal>
    );
  }
}
export default ContractDetailsModal;
