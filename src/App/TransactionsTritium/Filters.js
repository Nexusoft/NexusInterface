import React from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

import Select from 'components/Select';
import TextField from 'components/TextField';
import FormField from 'components/FormField';
import {
  setTxsAddressQuery,
  setTxsNameQuery,
  setTxsOperationFilter,
  setTxsTimeFilter,
} from 'lib/ui';

const operations = [
  'WRITE',
  'APPEND',
  'CREATE',
  'TRANSFER',
  'CLAIM',
  'COINBASE',
  'TRUST',
  'GENESIS',
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
  ...operations.map(op => ({
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

const Filters = ({
  addressQuery,
  operation,
  nameQuery,
  timeSpan,
  morePadding,
}) => (
  <FiltersWrapper morePadding={morePadding}>
    <FormField connectLabel label={__('Address')}>
      <TextField
        type="search"
        placeholder={__('Account/token address')}
        value={addressQuery}
        onChange={evt => {
          setTxsAddressQuery(evt.target.value);
        }}
      />
    </FormField>

    <FormField connectLabel label={__('Name')}>
      <TextField
        type="search"
        placeholder="Account/token name"
        value={nameQuery}
        onChange={evt => setTxsNameQuery(evt.target.value)}
      />
    </FormField>

    <FormField label={__('Time span')}>
      <Select
        value={timeSpan}
        onChange={setTxsTimeFilter}
        options={timeFrames}
      />
    </FormField>

    <FormField label={__('Operation')}>
      <Select
        value={operation}
        onChange={setTxsOperationFilter}
        options={opOptions}
      />
    </FormField>
  </FiltersWrapper>
);

const mapStateToProps = ({
  ui: {
    transactionsTritium: { addressQuery, operation, nameQuery, timeSpan },
  },
}) => ({
  addressQuery,
  operation,
  nameQuery,
  timeSpan,
});

export default connect(mapStateToProps)(Filters);
