import React from 'react';
import styled from '@emotion/styled';

import { formatNumber } from 'lib/intl';

const ContractComponent = styled.div({
  padding: '1em',
  width: '100%',
  display: 'grid',
  gridTemplateAreas: '"content" "delta"',
  gridTemplateColumns: '1fr max-content',
  gridColumnGap: '1em',
  alignItems: 'center',
});

const ContractContent = styled.div({});

const ContractDelta = styled.div(({ theme, negative }) => ({
  fontSize: '1.2em',
  justifySelf: 'end',
  color: negative ? theme.danger : theme.primary,
}));

const OpCode = styled.span({
  fontWeight: 'bold',
});

const contractContent = contract => {
  return <OpCode>{contract.OP}</OpCode>;
};

const negativeOperations = ['DEBIT', 'FEE'];
const contractDelta = contract => {
  if (!contract.amount) return;

  const sign = negativeOperations.includes(contract.OP) ? '-' : '+';
  return `${sign}${formatNumber(contract.amount)} ${contract.token_name ||
    'NXS'}`;
};

const Contract = ({ contract }) => (
  <ContractComponent>
    <ContractContent>{contractContent(contract)}</ContractContent>
    <ContractDelta negative={negativeOperations.includes(contract.OP)}>
      {contractDelta(contract)}
    </ContractDelta>
  </ContractComponent>
);

export default Contract;
