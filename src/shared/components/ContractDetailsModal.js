import React from 'react';
import styled from '@emotion/styled';

import Modal from 'components/Modal';
import Button from 'components/Button';
import TransactionDetailsModal from 'components/TransactionDetailsModal';
import { openModal } from 'lib/ui';

__ = __context('ContractDetails');

const Row = styled.div({
  display: 'grid',
  gridTemplateAreas: '"label value"',
  gridTemplateColumns: '1fr 3fr',
  alignItems: 'start',
  columnGap: '1em',
  marginBottom: '.6em',
});

const Label = styled.div(({ theme }) => ({
  gridArea: 'label',
  textAlign: 'right',
  color: theme.mixer(0.875),
  textTransform: 'capitalize',
}));

const Value = styled.div({
  gridArea: 'value',
  wordBreak: 'break-word',
});

const Field = ({ label, children }) => (
  <Row>
    <Label>{label}</Label>
    <Value>{children}</Value>
  </Row>
);

const translateKey = key => {
  switch (key) {
    case 'OP':
      return 'Operation';
    case 'txid':
      return 'Transaction ID';
    case 'token_name':
      return 'Token Name';
    case 'from_name':
      return 'From Name';
    default:
      return key;
  }
};

class ContractDetailsModal extends React.Component {
  render() {
    const { contract, txid } = this.props;
    if (!contract) return;

    return (
      <Modal
        assignClose={close => {
          this.closeModal = close;
        }}
      >
        <Modal.Header>{__('Contract Details')}</Modal.Header>
        <Modal.Body>
          {Object.entries(contract).map(([key, value]) => (
            <Field key={key} label={translateKey(key)}>
              {value}
            </Field>
          ))}
          <Field label="">
            <Button
              skin="hyperlink"
              onClick={() => {
                this.closeModal();
                openModal(TransactionDetailsModal, { txid });
              }}
            >
              {__('View transaction details')}
            </Button>
          </Field>
        </Modal.Body>
      </Modal>
    );
  }
}
export default ContractDetailsModal;
