import { useSelector } from 'react-redux';
import styled from '@emotion/styled';

import Icon from 'components/Icon';
import Select from 'components/Select';
import TextField from 'components/TextField';
import FormField from 'components/FormField';
import {
  setTxsAddressQuery,
  setTxsCategoryFilter,
  setTxsMinAmountFilter,
  setTxsTimeFilter,
} from 'lib/ui';

import searchIcon from 'icons/search.svg';

__ = __context('Transactions');

const categories = [
  {
    value: null,
    display: __('All'),
  },
  {
    value: 'receive', // Should be made credit with tritium.
    display: __('Receive'),
  },
  {
    value: 'send',
    display: __('Sent'),
  },
  {
    value: 'stake',
    display: __('Stake'),
  },
  {
    value: 'generate',
    display: __('Generate'),
  },
  {
    value: 'immature',
    display: __('Immature'),
  },
  {
    value: 'orphan',
    display: __('Orphan'),
  },
  {
    value: 'genesis',
    display: __('Genesis'),
  },
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
  gridTemplateAreas: '"search type minAmount timeFrame download"',
  gridTemplateColumns: '1fr 110px 100px 140px auto',
  columnGap: '.75em',
  alignItems: 'end',
  fontSize: 15,
  marginBottom: '1em',
  marginTop: '-1em',
});

export default function Filters() {
  const transactionsUI = useSelector((state) => state.ui.transactions);
  const { addressQuery, category, minAmount, timeSpan } = transactionsUI;

  return (
    <FiltersWrapper>
      <FormField connectLabel label={__('Search address')}>
        <TextField
          name="addressfilter"
          placeholder={__('Search for Address')}
          value={addressQuery}
          onChange={(evt) => {
            setTxsAddressQuery(evt.target.value);
          }}
          left={<Icon icon={searchIcon} className="mr0_4" />}
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
          onChange={(evt) => setTxsMinAmountFilter(evt.target.value)}
        />
      </FormField>

      <FormField label={__('Time span')}>
        <Select
          value={timeSpan}
          onChange={setTxsTimeFilter}
          options={timeFrames}
        />
      </FormField>
    </FiltersWrapper>
  );
}
