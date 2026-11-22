import styled from '@emotion/styled';

import InfoField from 'components/InfoField';
import Tooltip from 'components/Tooltip';
import { openModal } from 'lib/ui';
import { getAssetData } from 'lib/asset';
import { timing } from 'styles';

import AssetDetailsModal from './AssetDetailsModal';
import { RecordField, RecordLabel, RecordCreated } from '../RecordMetadata';

__ = __context('User.Assets');

const AssetComponent = styled.div(({ theme }) => ({
  margin: '1em 0',
  border: `1px solid ${theme.mixer(0.14)}`,
  borderRadius: 14,
  overflow: 'hidden',
  overflowWrap: 'anywhere',
  cursor: 'pointer',
  background: theme.background,
  transition: `background-color ${timing.normal}`,
  '&:hover, &:focus-visible': {
    background: theme.mixer(0.04),
    outline: `2px solid ${theme.primary}`,
    outlineOffset: 2,
  },
}));

const AssetHeader = styled.div(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 12,
  justifyContent: 'space-between',
  padding: '14px 18px',
  borderTopLeftRadius: 4,
  borderTopRightRadius: 4,
  background: theme.mixer(0.05),
  transition: `background-color ${timing.normal}`,
  [`${AssetComponent}:hover &`]: {
    background: theme.raise(theme.mixer(0.05), 0.2),
  },
}));

const AssetName = styled.div(({ theme, unnamed }) => ({
  color: unnamed ? theme.mixer(0.25) : theme.foreground,
  fontWeight: 'bold',
}));

const Ownership = styled.span(({ theme }) => ({
  color: theme.mixer(0.75),
  fontSize: '.8em',
  padding: '1px 5px',
  border: `1px solid ${theme.mixer(0.25)}`,
  borderRadius: 4,
}));

const AssetData = styled.div({
  padding: '.6em 1em .1em',
});

export default function Asset({ asset }) {
  const data = getAssetData(asset);

  return (
    <AssetComponent
      className="registry-record registry-asset"
      role="button"
      tabIndex={0}
      aria-label={asset.name || __('Unnamed asset')}
      onKeyDown={(event) => {
        if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          openModal(AssetDetailsModal, { asset });
        }
      }}
      onClick={() => {
        openModal(AssetDetailsModal, { asset });
      }}
    >
      <AssetHeader>
        <RecordField className="identity-field">
          <RecordLabel>{__('Asset')}</RecordLabel>
        <AssetName as="span" unnamed={!asset.name}>
          {asset.name || __('Unnamed asset')}
        </AssetName>
        </RecordField>
        <RecordCreated created={asset.created} label={__('Created')} unavailable={__('Unavailable')} />
        {typeof asset.ownership === 'number' && (
          <RecordField>
            <RecordLabel>{__('Ownership')}</RecordLabel>
          <Tooltip.Trigger
            tooltip={__('You own %{percentage}% of this asset', {
              percentage: asset.ownership,
            })}
          >
            <Ownership>{asset.ownership}%</Ownership>
          </Tooltip.Trigger>
          </RecordField>
        )}
      </AssetHeader>

      <AssetData>
        {Object.entries(data).map(([key, value]) => (
          <InfoField key={key} label={key} ratio={[1, 2]}>
            {value}
          </InfoField>
        ))}
      </AssetData>
    </AssetComponent>
  );
}
