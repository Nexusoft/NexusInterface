import React from 'react';
import styled from '@emotion/styled';

import Modal from 'components/Modal';
import { formatDateTime } from 'lib/intl';

const timeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
};

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
    default:
      return key;
  }
};

export default class ContractDetailsModal extends React.Component {
  render() {
    const { contract } = this.props;
    if (!contract) return;

    return (
      <Modal>
        <Modal.Header>{__('Contract Details')}</Modal.Header>
        <Modal.Body>
          {Object.entries(contract).map(([key, value]) => (
            <Field key={key} label={translateKey(key)}>
              {value}
            </Field>
          ))}
        </Modal.Body>
      </Modal>
    );
  }
}
