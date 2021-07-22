import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import styled from '@emotion/styled';

import Select from 'components/Select';
import TextField from 'components/TextField';
import FormField from 'components/FormField';
import AutoSuggest from 'components/AutoSuggest';
import TokenName from 'components/TokenName';
import { updateFilter } from 'lib/tritiumTransactions';
import { loadOwnedTokens, loadAccounts } from 'lib/user';
import { debounced } from 'utils/universal';

__ = __context('Transactions');

const updateAccountQuery = debounced(
  (accountQuery) => updateFilter({ accountQuery }),
  1000
);
const updateTokenQuery = debounced(
  (tokenQuery) => updateFilter({ tokenQuery }),
  1000
);

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
          name: account.token_name,
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
  gridTemplateAreas: '"addressSearch nameSearch timeFrame operation"',
  gridTemplateColumns: '3fr 2fr 100px 100px',
  columnGap: '.75em',
  alignItems: 'end',
  fontSize: 15,
  padding: `0 ${morePadding ? '26px' : '20px'} 10px 20px`,
}));

export default function Filters({ morePadding }) {
  const { accountQuery, tokenQuery, operation, timeSpan } = useSelector(
    (state) => state.ui.transactionsFilter
  );
  const tokenOptions = useSelector(({ user: { tokens, accounts } }) =>
    selectTokenOptions(tokens, accounts)
  );
  useEffect(() => {
    loadOwnedTokens();
    loadAccounts();
  }, []);
  return (
    <FiltersWrapper morePadding={morePadding}>
      <FormField connectLabel label={__('Account')}>
        <TextField
          type="search"
          placeholder={__('Account name/address')}
          value={accountQuery}
          onChange={(evt) => {
            updateAccountQuery(evt.target.value);
          }}
        />
      </FormField>

      <FormField connectLabel label={__('Token')}>
        <AutoSuggest
          inputComponent={TextField}
          inputProps={{
            placeholder: 'Token name/address',
            value: tokenQuery,
            onChange: (evt) => {
              updateTokenQuery(evt.target.value);
            },
          }}
          suggestions={tokenOptions}
          filterSuggestions={(suggestions) => suggestions}
          onSelect={(value) => {
            updateTokenQuery(value);
          }}
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
