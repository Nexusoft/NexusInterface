import React from 'react';
import styled from '@emotion/styled';

import InfoField from 'components/InfoField';
import { getAssetData } from 'utils/misc';
import * as color from 'utils/color';
import { timing } from 'styles';

__ = __context('User.Assets');

const AssetComponent = styled.div(({ theme }) => ({
  margin: '1em 0',
  boxShadow: '0 0 8px 0 rgba(0,0,0,.5)',
  borderRadius: 4,
  cursor: 'pointer',
  background: theme.background,
  // border: `1px solid ${theme.mixer(0.125)}`,
  transition: `background-color ${timing.normal}`,
  '&:hover': {
    // borderColor: color.fade(theme.primary, 0.3),
    background: color.lighten(theme.background, 0.2),
  },
}));

const AssetName = styled.div(({ theme, unnamed }) => ({
  color: unnamed ? theme.mixer(0.25) : theme.foreground,
  fontWeight: 'bold',
  padding: '.3em 1em',
  // borderBottom: `1px solid ${theme.mixer(0.125)}`,
  // background: color.lighten(theme.background, 0.15),
  borderTopLeftRadius: 4,
  borderTopRightRadius: 4,
  background: theme.mixer(0.05),
  transition: `background-color ${timing.normal}`,
  [`${AssetComponent}:hover &`]: {
    background: color.lighten(theme.mixer(0.05), 0.2),
  },
}));

const AssetData = styled.div({
  padding: '.3em 1em',
});

export default class Asset extends React.Component {
  render() {
    const { asset } = this.props;
    const data = getAssetData(asset);

    return (
      <AssetComponent>
        <AssetName unnamed={!asset.name}>
          {asset.name || __('Unnamed asset')}
        </AssetName>

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
