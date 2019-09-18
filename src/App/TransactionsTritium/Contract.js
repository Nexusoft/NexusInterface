import React from 'react';
import styled from '@emotion/styled';

import { formatNumber } from 'lib/intl';
import { consts } from 'styles';

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
  textTransform: 'uppercase',
});

const AddressComponent = styled.span({
  fontFamily: consts.monoFontFamily,
});

const Address = ({ children }) => {
  if (!children || typeof children !== 'string' || children.length <= 11)
    return children;
  return (
    <AddressComponent>
      {children.slice(0, 6)}...{children.slice(-5)}
    </AddressComponent>
  );
};

const contractContent = contract => {
  switch (contract.OP) {
    case 'WRITE': {
      return (
        <>
          <OpCode>Write</OpCode> to <Address>{contract.address}</Address>
        </>
      );
    }

    case 'APPEND': {
      return (
        <>
          <OpCode>Append</OpCode> to <Address>{contract.address}</Address>
        </>
      );
    }

    case 'CREATE': {
      return (
        <>
          <OpCode>Create</OpCode> {contract.object_type} =>{' '}
          <Address>{contract.address}</Address>
        </>
      );
    }

    case 'TRANSFER': {
      return (
        <>
          <OpCode>Transfer</OpCode> <Address>{contract.address}</Address> to{' '}
          <Address>{contract.destination}</Address>
        </>
      );
    }

    case 'CLAIM': {
      return (
        <>
          <OpCode>Claim</OpCode> <Address>{contract.address}</Address>
        </>
      );
    }

    case 'COINBASE': {
      return (
        <>
          <OpCode>Coinbase</OpCode>
        </>
      );
    }

    case 'TRUST': {
      return (
        <>
          <OpCode>Trust</OpCode>
        </>
      );
    }

    case 'GENESIS': {
      return (
        <>
          <OpCode>Genesis</OpCode> <Address>{contract.address}</Address>
        </>
      );
    }

    case 'DEBIT': {
      return (
        <>
          <OpCode>Debit</OpCode> from{' '}
          {contract.from_name || <Address>{contract.from}</Address>}
        </>
      );
    }

    case 'CREDIT': {
      return (
        <>
          <OpCode>Credit</OpCode> to{' '}
          {contract.account_name || <Address>{contract.account}</Address>}
        </>
      );
    }

    case 'MIGRATE': {
      return (
        <>
          <OpCode>Migrate</OpCode> to{' '}
          {contract.account_name || <Address>{contract.account}</Address>}
        </>
      );
    }

    case 'AUTHORIZE': {
      return (
        <>
          <OpCode>Authorize</OpCode> a transaction
        </>
      );
    }

    case 'FEE': {
      return (
        <>
          <OpCode>Fee</OpCode> from{' '}
          {contract.account_name || <Address>{contract.account}</Address>}
        </>
      );
    }

    case 'LEGACY': {
      return (
        <>
          <OpCode>Legacy Send</OpCode> from{' '}
          {contract.from_name || <Address>{contract.from}</Address>}
        </>
      );
    }

    default: {
      return <OpCode>{contract.OP}</OpCode>;
    }
  }
  return;
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
