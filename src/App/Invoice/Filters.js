import React from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

import Select from 'components/Select';
import TextField from 'components/TextField';
import FormField from 'components/FormField';
import {
  setInvoiceReferenceQuery,
  setInvoiceStatusFilter,
  setInvoiceTimeFilter,
} from 'lib/ui';

__ = __context('Transactions');

const operations = ['PENDING', 'PAID', 'REJECTED'];

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
  gridTemplateAreas: '"reference timeFrame operation"',
  gridTemplateColumns: '3fr 2fr 100px 100px',
  columnGap: '.75em',
  alignItems: 'end',
  fontSize: 15,
  padding: `0 ${morePadding ? '26px' : '20px'} 10px 20px`,
}));

const Filters = ({ referenceQuery, status, timeSpan, morePadding }) => (
  <FiltersWrapper>
    <FormField connectLabel label={__('Reference')}>
      <TextField
        type="search"
        placeholder="Reference Search"
        value={referenceQuery}
        onChange={evt => setInvoiceReferenceQuery(evt.target.value)}
      />
    </FormField>

    <FormField label={__('Time span')}>
      <Select
        value={timeSpan}
        onChange={setInvoiceTimeFilter}
        options={timeFrames}
      />
    </FormField>

    <FormField label={__('Status')}>
      <Select
        value={status}
        onChange={setInvoiceStatusFilter}
        options={opOptions}
      />
    </FormField>
  </FiltersWrapper>
);

const mapStateToProps = ({
  ui: {
    invoices: { referenceQuery, status, timeSpan },
  },
}) => ({
  referenceQuery,
  status,
  timeSpan,
});

export default connect(mapStateToProps)(Filters);
