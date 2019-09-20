import React from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

import Tooltip from 'components/Tooltip';
import ContractDetailsModal from 'components/ContractDetailsModal';
import { openModal } from 'actions/overlays';
import { formatNumber } from 'lib/intl';
import { consts, timing } from 'styles';
import * as color from 'utils/color';

const ContractComponent = styled.div(({ theme }) => ({
  flexGrow: 1,
  padding: '.8em 1em',
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

const ContractDelta = styled.div(({ theme, sign }) => ({
  gridArea: 'delta',
  fontSize: '1.2em',
  justifySelf: 'end',
  color:
    sign === '+'
      ? theme.primary
      : sign === '-'
      ? theme.danger
      : theme.foreground,
  '&::before': sign && {
    content: `"${sign}"`,
  },
}));

const Action = styled.span(({ theme }) => ({
  fontWeight: 'bold',
  color: theme.primary,
  textTransform: 'uppercase',
}));

const Info = styled.span(({ theme }) => ({
  color: theme.foreground,
}));

const AccountName = styled(Info)(({ theme }) => ({
  paddingBottom: '.15em ',
  borderBottom: `1px dotted ${theme.mixer(0.25)}`,
}));

const HashComponent = styled(Info)(({ theme }) => ({
  fontFamily: consts.monoFontFamily,
  paddingBottom: '.15em ',
  borderBottom: `1px dotted ${theme.mixer(0.25)}`,
}));

const RegisterType = styled(Info)({
  textTransform: 'lowercase',
});

const Hash = ({ children, ...rest }) => {
  if (!children || typeof children !== 'string' || children.length <= 11)
    return <span {...rest}>{children}</span>;
  return (
    <Tooltip.Trigger tooltip={children}>
      <HashComponent {...rest}>
        {children.slice(0, 6)}...{children.slice(-5)}
      </HashComponent>
    </Tooltip.Trigger>
  );
};

const Account = ({ name, address }) =>
  name ? (
    <>
      account{' '}
      <Tooltip.Trigger tooltip={address}>
        <AccountName>{name}</AccountName>
      </Tooltip.Trigger>
    </>
  ) : (
    <>
      address <Hash>{address}</Hash>
    </>
  );

const creditFrom = contract => {
  switch (contract.for) {
    case 'DEBIT':
      return <Account name={contract.from_name} address={contract.from} />;

    case 'LEGACY':
      return <Info>{__('Legacy transaction')}</Info>;

    case 'COINBASE':
      return <Info>{__('Coinbase transaction')}</Info>;

    default:
      return '';
  }
};

const contractContent = contract => {
  switch (contract.OP) {
    case 'WRITE': {
      return (
        <>
          <Action>Write</Action> data to <Account address={contract.address} />
        </>
      );
    }

    case 'APPEND': {
      return (
        <>
          <Action>Append</Action> data to <Account address={contract.address} />
        </>
      );
    }

    case 'CREATE': {
      return (
        <>
          <div>
            <Action>Create</Action> new{' '}
            <RegisterType>
              {contract.type === 'OBJECT' && contract.object_type + ' '}
              {contract.type}
            </RegisterType>{' '}
            register
          </div>
          <div>
            at address <Hash>{contract.address}</Hash>
          </div>
        </>
      );
    }

    case 'TRANSFER': {
      return (
        <>
          <Action>Transfer</Action> ownership of{' '}
          <Account address={contract.address} /> to{' '}
          <Account address={contract.destination} />
        </>
      );
    }

    case 'CLAIM': {
      return (
        <>
          <Action>Claim</Action> ownership of{' '}
          <Account address={contract.address} />
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
          <Action>Genesis</Action> <Hash>{contract.address}</Hash>
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
            <Account name={contract.to_name} address={contract.to} />
          </div>
          <div>from {creditFrom(contract)}</div>
        </>
      );
    }

    case 'MIGRATE': {
      return (
        <>
          <div>
            <Action>Migrate</Action> trust key to{' '}
            <Account name={contract.account_name} address={contract.account} />
          </div>
          <div>
            from <Hash>{contract.hashkey}</Hash>
          </div>
        </>
      );
    }

    case 'AUTHORIZE': {
      return (
        <>
          <div>
            <Action>Authorize</Action> transaction <Hash>{contract.txid}</Hash>
          </div>
          <div>
            with a temporal proof <Hash>{contract.proof}</Hash>
          </div>
        </>
      );
    }

    case 'FEE': {
      return (
        <>
          <Action>Fee</Action> from{' '}
          <Account name={contract.from_name} address={contract.from} />
        </>
      );
    }

    case 'LEGACY': {
      return (
        <>
          <div>
            <Action>Legacy</Action> debit from{' '}
            <Account name={contract.from_name} address={contract.from} />
          </div>
          <div>
            to <Account address={contract.to} />
          </div>
        </>
      );
    }

    default: {
      return <Action>{contract.OP}</Action>;
    }
  }
};

const deltaSign = contract => {
  switch (contract.OP) {
    case 'CREDIT':
    case 'COINBASE':
    case 'TRUST':
    case 'GENESIS':
    case 'MIGRATE':
      return '+';

    case 'DEBIT':
    case 'FEE':
    case 'LEGACY':
      return '-';

    default:
      return '';
  }
};

const Contract = ({ contract, openModal }) => (
  <ContractComponent
    onClick={() => openModal(ContractDetailsModal, { contract })}
  >
    <ContractContent>{contractContent(contract)}</ContractContent>
    {!!contract.amount && (
      <ContractDelta sign={deltaSign(contract)}>
        {formatNumber(contract.amount)} {contract.token_name || 'NXS'}
      </ContractDelta>
    )}
  </ContractComponent>
);

const actionCreators = { openModal };

export default connect(
  null,
  actionCreators
)(Contract);
