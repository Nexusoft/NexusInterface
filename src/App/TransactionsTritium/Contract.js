import React from 'react';
import styled from '@emotion/styled';

import Tooltip from 'components/Tooltip';
import { formatNumber } from 'lib/intl';
import { consts, timing } from 'styles';
import * as color from 'utils/color';

const ContractComponent = styled.div(({ theme }) => ({
  flexGrow: 1,
  padding: '1em',
  width: '100%',
  display: 'grid',
  gridTemplateAreas: '"content delta"',
  gridTemplateColumns: '1fr max-content',
  gridColumnGap: '1em',
  alignItems: 'center',
  cursor: 'pointer',
  transition: `background ${timing.normal}`,
  '&:hover': {
    background: color.lighten(theme.background, 0.2),
  },
}));

const ContractContent = styled.div({
  gridArea: 'content',
});

const ContractDelta = styled.div(({ theme, negative }) => ({
  gridArea: 'delta',
  fontSize: '1.2em',
  justifySelf: 'end',
  color: negative ? theme.danger : theme.primary,
}));

const Action = styled.span(({ theme }) => ({
  fontWeight: 'bold',
  color: theme.primary,
}));

const AccountName = styled.span(({ theme }) => ({
  // fontWeight: 'bold',
  paddingBottom: '.15em ',
  borderBottom: `1px dotted ${theme.mixer(0.25)}`,
  color: theme.foreground,
}));

const AddressComponent = styled.span(({ theme }) => ({
  fontFamily: consts.monoFontFamily,
  paddingBottom: '.15em ',
  borderBottom: `1px dotted ${theme.mixer(0.25)}`,
  color: theme.foreground,
}));

const Address = ({ children, ...rest }) => {
  if (!children || typeof children !== 'string' || children.length <= 11)
    return <span {...rest}>{children}</span>;
  return (
    <AddressComponent {...rest}>
      {children.slice(0, 6)}...{children.slice(-5)}
    </AddressComponent>
  );
};

const Account = ({ name, address }) => (
  <>
    {name ? 'account ' : 'address '}
    <Tooltip.Trigger tooltip={address}>
      {name ? <AccountName>{name}</AccountName> : <Address>{address}</Address>}
    </Tooltip.Trigger>
  </>
);

const contractContent = contract => {
  switch (contract.OP) {
    case 'WRITE': {
      return (
        <>
          <Action>Write</Action> to <Account address={contract.address} />
        </>
      );
    }

    case 'APPEND': {
      return (
        <>
          <Action>Append</Action> to <Account address={contract.address} />
        </>
      );
    }

    case 'CREATE': {
      return (
        <>
          <Action>Create</Action> {contract.object_type} =>{' '}
          <Account address={contract.address} />
        </>
      );
    }

    case 'TRANSFER': {
      return (
        <>
          <Action>Transfer</Action> <Account address={contract.address} /> to{' '}
          <Account address={contract.destination} />
        </>
      );
    }

    case 'CLAIM': {
      return (
        <>
          <Action>Claim</Action> <Account address={contract.address} />
        </>
      );
    }

    case 'COINBASE': {
      return (
        <>
          <Action>Coinbase</Action>
        </>
      );
    }

    case 'TRUST': {
      return (
        <>
          <Action>Trust</Action>
        </>
      );
    }

    case 'GENESIS': {
      return (
        <>
          <Action>Genesis</Action> <Account address={contract.address} />
        </>
      );
    }

    case 'DEBIT': {
      return (
        <>
          <div>
            <Action>Debit</Action> from{' '}
            <Account name={contract.from_name} address={contract.from} />
          </div>
          <div>
            to <Account name={contract.to_name} address={contract.to} />
          </div>
        </>
      );
    }

    case 'CREDIT': {
      return (
        <>
          <div>
            <Action>Credit</Action> to{' '}
            <Account name={contract.account_name} address={contract.account} />
          </div>
          <div>
            from <Account name={contract.from_name} address={contract.from} />
          </div>
        </>
      );
    }

    case 'MIGRATE': {
      return (
        <>
          <Action>Migrate</Action> to{' '}
          {contract.account_name || <Account address={contract.account} />}
        </>
      );
    }

    case 'AUTHORIZE': {
      return (
        <>
          <Action>Authorize</Action> a transaction
        </>
      );
    }

    case 'FEE': {
      return (
        <>
          <Action>Fee</Action> from{' '}
          {contract.account_name || <Account address={contract.account} />}
        </>
      );
    }

    case 'LEGACY': {
      return (
        <>
          <Action>Legacy Send</Action> from{' '}
          {contract.from_name || <Account address={contract.from} />}
        </>
      );
    }

    default: {
      return <Action>{contract.OP}</Action>;
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
