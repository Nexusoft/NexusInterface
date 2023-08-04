import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import styled from '@emotion/styled';

import Select from 'components/Select';
import TextField from 'components/TextField';
import FormField from 'components/FormField';
import Icon from 'components/Icon';
import Button from 'components/Button';
import Tooltip from 'components/Tooltip';
import { updateFilter } from 'lib/transactions';
import { loadOwnedTokens, loadAccounts } from 'lib/user';
import { openModal } from 'lib/ui';
import { debounced } from 'utils/universal';
import ListIcon from 'icons/list.svg';
import SearchIcon from 'icons/search.svg';
import SelectAddressModal from './SelectAddressModal';

__ = __context('Transactions');

const debouncedUpdateFilter = debounced(
  (updates) => updateFilter(updates),
  500
);

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
