import styled from '@emotion/styled';

import Tooltip from 'components/Tooltip';
import ContractDetailsModal from 'components/ContractDetailsModal';
import TransactionDetailsModal from 'components/TransactionDetailsModal';
import Icon from 'components/Icon';
import TokenName from 'components/TokenName';
import { openModal } from 'lib/ui';
import { popupContextMenu } from 'lib/contextMenu';
import { formatNumber } from 'lib/intl';
import { getDeltaSign } from 'lib/tritiumTransactions';
import { lookupAddress } from 'lib/addressBook';
import contactIcon from 'icons/address-book.svg';
import walletIcon from 'icons/wallet.svg';
import tokenIcon from 'icons/token.svg';
import * as color from 'utils/color';
import { consts, timing } from 'styles';

__ = __context('Transactions');

const ContractComponent = styled.div(({ theme }) => ({
  flexGrow: 1,
  padding: '.6em 1em',
  width: '100%',
  display: 'grid',
  gridTemplateAreas: '"content delta"',
  gridTemplateColumns: '1fr max-content',
  gridColumnGap: '1em',
  alignItems: 'center',
  cursor: 'pointer',
  transition: `background ${timing.normal}`,
  '&:hover': {
    background: color.lighten(theme.lower(theme.background, 0.1), 0.2),
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

const Operation = styled.span(({ theme }) => ({
  fontWeight: 'bold',
  color: theme.primary,
  textTransform: 'uppercase',
}));

const Info = styled.span(({ theme }) => ({
  color: theme.foreground,
}));

const RegisterName = styled(Info)(({ theme }) => ({
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

const accountLabel = (name, address) => {
  if (name) {
    if (name.startsWith('local:')) {
      return (
        <span>
          <span className="dim">(?):</span>
          {name.substring(6)}
        </span>
      );
    } else {
      return name;
    }
  }
  if (!address) return null;
  const match = lookupAddress(address);
  if (match) {
    return (
      <span>
        <Icon icon={contactIcon} className="mr0_4" />
        <span className="v-align">
          {match.name + (match.label ? ' - ' + match.label : '')}
        </span>
      </span>
    );
  }
  return null;
};

const Register = ({ name, address, type }) => {
  const label = accountLabel(name, address);
  const typeIcon =
    type === 'ACCOUNT' || type === 'TRUST'
      ? walletIcon
      : type === 'TOKEN'
      ? tokenIcon
      : null;
  const display = label ? (
    <Tooltip.Trigger tooltip={address}>
      <RegisterName>{label}</RegisterName>
    </Tooltip.Trigger>
  ) : (
    <Hash>{address}</Hash>
  );

  return (
    <span>
      {!!typeIcon && (
        <Tooltip.Trigger tooltip={type}>
          <Icon icon={typeIcon} className="mr0_4" />
        </Tooltip.Trigger>
      )}
      <span className="v-align">{display}</span>
    </span>
  );
};

const creditFrom = (contract) => {
  switch (contract.for) {
    case 'DEBIT':
      if (contract.from) {
        return <Register {...contract.from} />;
      } else {
        return '';
      }

    case 'LEGACY':
      return <Info>{__('Legacy transaction')}</Info>;

    case 'COINBASE':
      return <Info>{__('Coinbase transaction')}</Info>;

    default:
      return '';
  }
};

const contractContent = (contract) => {
  switch (contract.OP) {
    case 'WRITE': {
      return (
        <>
          <Operation>Write</Operation> data to{' '}
          <Register name={contract.name} address={contract.address} />
        </>
      );
    }

    case 'APPEND': {
      return (
        <>
          <Operation>Append</Operation> data to{' '}
          <Register name={contract.name} address={contract.address} />
        </>
      );
    }

    case 'CREATE': {
      return (
        <>
          <div>
            <Operation>Create</Operation> new{' '}
            <RegisterType>
              {contract.type === 'OBJECT' && contract.object_type + ' '}
              {contract.type}
            </RegisterType>{' '}
            register
          </div>
          <div>
            at <Register name={contract.name} address={contract.address} />
          </div>
        </>
      );
    }

    case 'TRANSFER': {
      return (
        <>
          <Operation>Transfer</Operation> ownership of{' '}
          <Register name={contract.name} address={contract.address} /> to{' '}
          {typeof contract.recipient === 'string' ? (
            <Register address={contract.recipient} />
          ) : (
            <Register
              name={contract.recipient?.name}
              address={contract.recipient?.address}
            />
          )}
        </>
      );
    }

    case 'CLAIM': {
      return (
        <>
          <Operation>Claim</Operation> ownership of{' '}
          <Register name={contract.name} address={contract.address} />
        </>
      );
    }

    case 'COINBASE': {
      return (
        <>
          <Operation>Coinbase</Operation>
        </>
      );
    }

    case 'TRUST': {
      return (
        <>
          <Operation>Trust</Operation>
        </>
      );
    }

    case 'TRUSTPOOL': {
      return (
        <>
          <Operation>TrustPool</Operation>
        </>
      );
    }

    case 'GENESIS': {
      return (
        <>
          <Operation>Genesis</Operation> at{' '}
          <Register name={contract.name} address={contract.address} />
        </>
      );
    }

    case 'GENESISPOOL': {
      return (
        <>
          <Operation>GenesisPool</Operation> at{' '}
          <Register name={contract.name} address={contract.address} />
        </>
      );
    }

    case 'DEBIT': {
      return (
        <>
          <div>
            <Operation>Debit</Operation> from <Register {...contract.from} />
          </div>
          <div>
            to <Register {...contract.to} />
          </div>
        </>
      );
    }

    case 'CREDIT': {
      const from = creditFrom(contract);
      return (
        <>
          <div>
            <Operation>Credit</Operation> to <Register {...contract.to} />
          </div>
          <div>{from && <div>from {from}</div>}</div>
        </>
      );
    }

    case 'MIGRATE': {
      return (
        <>
          <div>
            <Operation>Migrate</Operation> trust key to{' '}
            <Register name={contract.name} address={contract.address} />
          </div>
          <div>
            from <Hash>{contract.last}</Hash>
          </div>
        </>
      );
    }

    case 'AUTHORIZE': {
      return (
        <>
          <div>
            <Operation>Authorize</Operation> transaction{' '}
            <Hash>{contract.txid}</Hash>
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
          <Operation>Fee</Operation> from <Register {...contract.from} />
        </>
      );
    }

    case 'LEGACY': {
      return (
        <>
          <div>
            <Operation>Legacy</Operation> debit from{' '}
            <Register {...contract.from} />
          </div>
          <div>
            to <Register {...contract.to} />
          </div>
        </>
      );
    }

    default: {
      return <Operation>{contract.OP}</Operation>;
    }
  }
};

const Contract = ({ contract, txid }) => (
  <ContractComponent
    onClick={() => openModal(ContractDetailsModal, { contract, txid })}
    onContextMenu={(e) => {
      e.stopPropagation();
      popupContextMenu([
        {
          id: 'contract-details',
          label: __('View contract details'),
          click: () => {
            openModal(ContractDetailsModal, { contract, txid });
          },
        },
        {
          id: 'tx-details',
          label: __('View transaction details'),
          click: () => {
            openModal(TransactionDetailsModal, { txid });
          },
        },
      ]);
    }}
  >
    <ContractContent>{contractContent(contract)}</ContractContent>
    {!!contract.amount && (
      <ContractDelta sign={getDeltaSign(contract)}>
        {formatNumber(contract.amount)}{' '}
        {contract.token ? <TokenName contract={contract} /> : 'NXS'}
      </ContractDelta>
    )}
  </ContractComponent>
);

export default Contract;
