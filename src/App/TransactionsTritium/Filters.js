import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import styled from '@emotion/styled';

import Select from 'components/Select';
import TextField from 'components/TextField';
import FormField from 'components/FormField';
import AutoSuggest from 'components/AutoSuggest';
import TokenName from 'components/TokenName';
import Icon from 'components/Icon';
import Button from 'components/Button';
import Tooltip from 'components/Tooltip';
import { updateFilter } from 'lib/tritiumTransactions';
import { loadOwnedTokens, loadAccounts } from 'lib/user';
import { openModal } from 'lib/ui';
import { debounced } from 'utils/universal';
import memoize from 'utils/memoize';
import ListIcon from 'icons/list.svg';
import SearchIcon from 'icons/search.svg';
import SelectAddressModal from './SelectAddressModal';

__ = __context('Transactions');

const debouncedUpdateFilter = debounced(
  (updates) => updateFilter(updates),
  500
);

const selectAccountOptions = memoize((accounts, addressBook) => {
  const accountsMap = {};
  if (accounts) {
    for (const account of accounts) {
      const { address } = account;
      if (address && !accountsMap[address]) {
        accountsMap[address] = {
          type: 'account',
          address,
          account,
        };
      }
    }
  }
  if (addressBook) {
    for (const contact of Object.values(addressBook)) {
      for (const { address, isMine, label } of contact.addresses) {
        if (!isMine && address && !accountsMap[address]) {
          accountsMap[address] = {
            type: 'contact',
            address,
            name: contact.name,
            label,
          };
        }
      }
    }
  }
  return Object.values(accountsMap).map(
    ({ type, address, account, name, label }) => ({
      value: address,
      display:
        type === 'account' ? (
          <span>
            {account.name || <em>{__('Unnamed account')}</em>}{' '}
            <span className="dim">{address}</span>
          </span>
        ) : (
          <span>
            {name}
            {label ? ' - ' + label : ''} <span className="dim">{address}</span>
          </span>
        ),
    })
  );
});

const selectTokenOptions = memoize((ownedTokens, accounts) => {
  const tokensMap = {
    0: {
      address: '0',
      name: 'NXS',
    },
  };
  if (ownedTokens) {
    for (const token of ownedTokens) {
      if (token.address && !tokensMap[token.address]) {
        tokensMap[token.address] = token;
      }
    }
  }
  if (accounts) {
    for (const account of accounts) {
      if (account.token && !tokensMap[account.token]) {
        tokensMap[account.token] = {
          address: account.token,
          name: account.ticker,
        };
      }
    }
  }
  return Object.values(tokensMap).map((token) => ({
    value: token.address,
    display: TokenName.from({ token }),
  }));
});

const operations = [
  'WRITE',
  'APPEND',
  'CREATE',
  'TRANSFER',
  'CLAIM',
  'COINBASE',
  'TRUST',
  'GENESIS',
  'TRUSTPOOL',
  'GENESISPOOL',
  'DEBIT',
  'CREDIT',
  'MIGRATE',
  'AUTHORIZE',
  'FEE',
  'LEGACY',
];

const opOptions = [
  {
    value: null,
    display: __('All'),
  },
  ...operations.map((op) => ({
    value: op,
    display: op,
  })),
];

const timeFrames = [
  {
    value: null,
    display: __('All'),
  },
  {
    value: 'year',
    display: __('Past Year'),
  },
  {
    value: 'month',
    display: __('Past Month'),
  },
  {
    value: 'week',
    display: __('Past Week'),
  },
];

const FiltersWrapper = styled.div(({ morePadding }) => ({
  gridArea: 'filters',
  display: 'grid',
  gridTemplateAreas: '"addressSearch timeFrame operation"',
  gridTemplateColumns: '3fr  100px 100px',
  columnGap: '.75em',
  alignItems: 'end',
  fontSize: 15,
  padding: `0 ${morePadding ? '26px' : '20px'} 10px 20px`,
}));

export default function Filters({ morePadding }) {
  const { addressQuery, operation, timeSpan } = useSelector(
    (state) => state.ui.transactionsFilter
  );
  const accountOptions = useSelector(({ addressBook, user: { accounts } }) =>
    selectAccountOptions(accounts, addressBook)
  );
  const [addressInput, setAddressInput] = useState(addressQuery);
  useEffect(() => {
    loadOwnedTokens();
    loadAccounts();
  }, []);
  return (
    <FiltersWrapper morePadding={morePadding}>
      <FormField connectLabel label={__('Address')}>
        <TextField
          placeholder={__('Search for account/token address')}
          value={addressInput}
          onChange={({ target: { value } }) => {
            setAddressInput(value);
            debouncedUpdateFilter({ addressQuery: value });
          }}
          left={<Icon icon={SearchIcon} className="mr1" />}
          right={
            <Tooltip.Trigger tooltip={__('Select an address')}>
              <Button
                skin="plain"
                fitHeight
                onClick={() => {
                  openModal(SelectAddressModal, {
                    onSelect: (address) => {
                      setAddressInput(address);
                      updateFilter({ addressQuery: address });
                    },
                  });
                }}
              >
                <Icon icon={ListIcon} />
              </Button>
            </Tooltip.Trigger>
          }
        />
      </FormField>

      <FormField label={__('Time span')}>
        <Select
          value={timeSpan}
          onChange={(timeSpan) => {
            updateFilter({ timeSpan });
          }}
          options={timeFrames}
        />
      </FormField>

      <FormField label={__('Operation')}>
        <Select
          value={operation}
          onChange={(operation) => {
            updateFilter({ operation });
          }}
          options={opOptions}
        />
      </FormField>
    </FiltersWrapper>
  );
}
