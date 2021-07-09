import { useSelector } from 'react-redux';
import styled from '@emotion/styled';

import Select from 'components/Select';
import TextField from 'components/TextField';
import FormField from 'components/FormField';
import { updateFilter } from 'lib/tritiumTransactions';

__ = __context('Transactions');

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

export default function Filters() {
  const { accountQuery, tokenQuery, operation, timeSpan, morePadding } =
    useSelector((state) => state.ui.transactionsPage);
  return (
    <FiltersWrapper morePadding={morePadding}>
      <FormField connectLabel label={__('Account')}>
        <TextField
          type="search"
          placeholder={__('Account name/address')}
          value={accountQuery}
          onChange={(evt) => {
            updateFilter({ accountQuery: evt.target.value });
          }}
        />
      </FormField>

      <FormField connectLabel label={__('Token')}>
        <TextField
          type="search"
          placeholder="Token name/address"
          value={tokenQuery}
          onChange={(evt) => {
            updateFilter({ tokenQuery: evt.target.value });
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
