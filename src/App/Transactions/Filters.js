import { moduleLayout } from 'utils/moduleStyles';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';
import { fade, mix } from 'utils/color';

import Select from 'components/Select';
import TextField from 'components/TextField';
import FormField from 'components/FormField';
import Icon from 'components/Icon';
import Button from 'components/Button';
import Tooltip from 'components/Tooltip';
import { updateFilter } from 'lib/transactions';
import { refreshOwnedTokens, refreshAccounts } from 'lib/user';
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

const FiltersWrapper = styled.div(({ morePadding, theme }) => ({
  gridArea: 'filters',
  display: 'grid',
  gridTemplateAreas: '"addressSearch timeFrame operation"',
  gridTemplateColumns: '3fr  100px 100px',
  columnGap: '.75em',
  alignItems: 'end',
  fontSize: 15,
  padding: `0 ${morePadding ? '26px' : '20px'} 10px 20px`,
  ...(theme.modern && {
    minWidth: 0, padding: '10px 16px 14px', gap: 12, flexShrink: 0,
    gridTemplateColumns: 'minmax(0, 1fr) 140px 140px',
    '& > div': { minWidth: 0, margin: 0 },
    '& label': { position: 'absolute', width: 1, height: 1, overflow: 'hidden', clipPath: 'inset(50%)' },
    '& input': { fontSize: 13 },
    '@media (max-width: 700px)': {
      gridTemplateAreas: 'none', gridTemplateColumns: 'minmax(0, 1fr)',
    },
    '@container transaction-history (max-width: 650px)': {
      gridTemplateAreas: 'none', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10, padding: '8px 16px 16px',
      '> div:first-of-type': { gridColumn: '1 / -1' },
    },
  }),
}));

const SearchField = styled(TextField)(({ theme }) => theme.modern && ({
  borderRadius: 10, minHeight: moduleLayout.controlHeight, color: theme.foreground,
  paddingLeft: 14,
  '> svg': { width: 16, height: 16, flexShrink: 0, margin: 0 },
  '> input': { flex: '1 1 0%', minWidth: 0, width: 0, paddingLeft: 10 },
  '> button': { flexShrink: 0 },
  background: mix(theme.background, '#000000', 0.18),
  borderColor: fade(theme.primary, 0.82),
  '&:hover': { borderColor: fade(theme.primary, 0.55) },
  '&:focus-within': { borderColor: theme.primary, boxShadow: `0 0 0 2px ${fade(theme.primary, 0.9)}` },
  'input::placeholder': { color: theme.mixer(0.6), opacity: 1 },
  svg: { color: theme.primary },
}));

const FilterSelect = styled(Select)(({ theme }) => theme.modern && ({
  borderRadius: 10, height: moduleLayout.controlHeight, fontSize: 13,
  background: mix(theme.background, theme.primary, 0.07), color: theme.foreground,
  borderColor: fade(theme.primary, 0.8),
  '&:hover': { background: mix(theme.background, theme.primary, 0.12), borderColor: fade(theme.primary, 0.5) },
  svg: { color: theme.primary },
}));

export default function Filters({ morePadding }) {
  const { modern } = useTheme();
  const { addressQuery, operation, timeSpan } = useSelector(
    (state) => state.ui.transactionsFilter
  );
  const [addressInput, setAddressInput] = useState(addressQuery);
  useEffect(() => {
    refreshOwnedTokens();
    refreshAccounts();
  }, []);
  return (
    <FiltersWrapper morePadding={morePadding}>
      <FormField connectLabel label={__('Address')}>
        <SearchField
          skin={modern ? 'filled-inverted' : 'underline'}
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
        <FilterSelect
          skin={modern ? 'filled-inverted' : 'underline'}
          aria-label={__('Time span')}
          value={timeSpan}
          onChange={(timeSpan) => {
            updateFilter({ timeSpan });
          }}
          options={modern ? timeFrames.map((option) => option.value === null ? { ...option, display: __('All dates') } : option) : timeFrames}
        />
      </FormField>

      <FormField label={__('Operation')}>
        <FilterSelect
          skin={modern ? 'filled-inverted' : 'underline'}
          aria-label={__('Operation')}
          value={operation}
          onChange={(operation) => {
            updateFilter({ operation });
          }}
          options={modern ? opOptions.map((option) => option.value === null ? { ...option, display: __('All types') } : option) : opOptions}
        />
      </FormField>
    </FiltersWrapper>
  );
}
