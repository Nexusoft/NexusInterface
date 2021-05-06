import { Component } from 'react';

import ControlledModal from 'components/ControlledModal';
import Button from 'components/Button';
import InfoField from 'components/InfoField';
import TransactionDetailsModal from 'components/TransactionDetailsModal';
import { openModal } from 'lib/ui';

__ = __context('ContractDetails');

const translateKey = (key) => {
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

class ContractDetailsModal extends Component {
  render() {
    const { contract, txid } = this.props;
    if (!contract) return;

    return (
      <ControlledModal
        assignClose={(close) => {
          console.log('assign', close);
          this.closeModal = close;
        }}
      >
        <ControlledModal.Header>
          {__('Contract Details')}
        </ControlledModal.Header>
        <ControlledModal.Body>
          {Object.entries(contract).map(([key, value]) => (
            <InfoField key={key} label={translateKey(key)}>
              {value}
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
        </ControlledModal.Body>
      </ControlledModal>
    );
  }
}
export default ContractDetailsModal;
