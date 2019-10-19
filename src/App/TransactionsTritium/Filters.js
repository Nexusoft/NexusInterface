import React from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

import Icon from 'components/Icon';
import Select from 'components/Select';
import TextField from 'components/TextField';
import FormField from 'components/FormField';
import {
  setTxsAddressQuery,
  setTxsAccountNameFilter,
  setTxsOperationFilter,
  setTxsTimeFilter,
} from 'lib/ui';

import searchIcon from 'icons/search.svg';

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

const FiltersWrapper = styled.div({
  gridArea: 'filters',
  display: 'grid',
  gridTemplateAreas: '"search accountName timeFrame operation"',
  gridTemplateColumns: '1fr 160px 140px 110px',
  columnGap: '.75em',
  alignItems: 'end',
  fontSize: 15,
  padding: '0 30px 10px',
});

const Filters = ({ addressQuery, operation, accountName, timeSpan }) => (
  <FiltersWrapper>
    <FormField connectLabel label={__('Search address')}>
      <TextField
        type="search"
        name="addressfilter"
        placeholder={__('Search for Address')}
        value={addressQuery}
        onChange={evt => {
          setTxsAddressQuery(evt.target.value);
        }}
        left={<Icon icon={searchIcon} className="space-right" />}
      />
    </FormField>

    <FormField connectLabel label={__('Account name')}>
      <TextField
        placeholder="Account name"
        value={accountName}
        onChange={evt => setTxsAccountNameFilter(evt.target.value)}
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
    transactionsTritium: { addressQuery, operation, accountName, timeSpan },
  },
}) => ({
  addressQuery,
  operation,
  accountName,
  timeSpan,
});

export default connect(mapStateToProps)(Filters);
