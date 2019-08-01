import React from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

import Icon from 'components/Icon';
import Select from 'components/Select';
import TextField from 'components/TextField';
import FormField from 'components/FormField';
import Button from 'components/Button';
import Tooltip from 'components/Tooltip';
import {
  setTxsAddressQuery,
  setTxsCategoryFilter,
  setTxsMinAmountFilter,
  setTxsTimeFilter,
} from 'actions/ui';

import downloadIcon from 'images/download.sprite.svg';
import searchIcon from 'images/search.sprite.svg';

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
  display: 'grid',
  gridTemplateAreas: '"search type minAmount timeFrame download"',
  gridTemplateColumns: '1fr 110px 100px 140px auto',
  columnGap: '.75em',
  alignItems: 'end',
  fontSize: 15,
  marginBottom: '1em',
});

const Filters = ({
  addressQuery,
  category,
  minAmount,
  timeSpan,
  setTxsAddressQuery,
  setTxsCategoryFilter,
  setTxsMinAmountFilter,
  setTxsTimeFilter,
}) => (
  <FiltersWrapper>
    <FormField connectLabel label={__('Search address')}>
      <TextField
        inputProps={{
          type: 'search',
          name: 'addressfilter',
          placeholder: 'Search for Address',
          value: addressQuery,
          onChange: evt => setTxsAddressQuery(evt.target.value),
        }}
        left={<Icon icon={searchIcon} className="space-right" />}
      />
    </FormField>

    <FormField label={__('Category')}>
      <Select
        value={category}
        onChange={setTxsCategoryFilter}
        options={categories}
      />
    </FormField>

    <FormField connectLabel label={__('Min amount')}>
      <TextField
        type="number"
        min="0"
        placeholder="0.00"
        value={minAmount}
        onChange={evt => setTxsMinAmountFilter(evt.target.value)}
      />
    </FormField>

    <FormField label={__('Time span')}>
      <Select
        value={timeSpan}
        onChange={setTxsTimeFilter}
        options={timeFrames}
      />
    </FormField>

    <Tooltip.Trigger tooltip={__('Download')}>
      <Button square className="relative" onClick={() => this.DownloadCSV()}>
        <Icon icon={downloadIcon} />
      </Button>
    </Tooltip.Trigger>
  </FiltersWrapper>
);

const mapStateToProps = ({
  ui: {
    transactions: { addressQuery, category, minAmount, timeSpan },
  },
}) => ({
  addressQuery,
  category,
  minAmount,
  timeSpan,
});

const actonCreators = {
  setTxsAddressQuery,
  setTxsCategoryFilter,
  setTxsMinAmountFilter,
  setTxsTimeFilter,
};

export default connect(
  mapStateToProps,
  actonCreators
)(Filters);
