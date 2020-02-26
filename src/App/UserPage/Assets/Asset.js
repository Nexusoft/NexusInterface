import React from 'react';
import styled from '@emotion/styled';

import InfoField from 'components/InfoField';
import Tooltip from 'components/Tooltip';
import { openModal } from 'lib/ui';
import { getAssetData } from 'utils/misc';
import * as color from 'utils/color';
import { timing } from 'styles';

import AssetDetailsModal from './AssetDetailsModal';

__ = __context('User.Assets');

const AssetComponent = styled.div(({ theme }) => ({
  margin: '1em 0',
  boxShadow: '0 0 8px 0 rgba(0,0,0,.5)',
  borderRadius: 4,
  cursor: 'pointer',
  background: theme.background,
  transition: `background-color ${timing.normal}`,
  '&:hover': {
    background: color.lighten(theme.background, 0.2),
  },
}));

const AssetHeader = styled.div(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  padding: '.3em 1em',
  borderTopLeftRadius: 4,
  borderTopRightRadius: 4,
  background: theme.mixer(0.05),
  transition: `background-color ${timing.normal}`,
  [`${AssetComponent}:hover &`]: {
    background: color.lighten(theme.mixer(0.05), 0.2),
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

export default class Asset extends React.Component {
  render() {
    const { asset } = this.props;
    const data = getAssetData(asset);

    return (
      <AssetComponent
        onClick={() => {
          openModal(AssetDetailsModal, { asset });
        }}
      >
        <AssetHeader>
          <AssetName unnamed={!asset.name}>
            {asset.name || __('Unnamed asset')}
          </AssetName>
          {typeof asset.ownership === 'number' && (
            <Tooltip.Trigger
              tooltip={__('You own %{percentage}% of this asset', {
                percentage: asset.ownership,
              })}
            >
              <Ownership>{asset.ownership}%</Ownership>
            </Tooltip.Trigger>
          )}
        </AssetHeader>

        <AssetData>
          {Object.entries(data).map(([key, value]) => (
            <InfoField key={key} label={key}>
              {value}
            </InfoField>
          ))}
        </AssetData>
      </AssetComponent>
    );
  }
}
