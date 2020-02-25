import React from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

import Icon from 'components/Icon';
import Button from 'components/Button';
import { switchUserTab } from 'lib/ui';
import { loadAssets } from 'lib/user';
import { openModal } from 'lib/ui';
import plusIcon from 'icons/plus.svg';

import Asset from './Asset';
import TabContentWrapper from '../TabContentWrapper';

__ = __context('User.Assets');

const EmptyMessage = styled.div(({ theme }) => ({
  padding: '10px 20px',
  fontStyle: 'italic',
  color: theme.mixer(0.5),
}));

@connect(state => ({
  assets: state.user.assets,
}))
export default class Assets extends React.Component {
  constructor(props) {
    super(props);
    switchUserTab('Assets');
  }

  componentDidMount() {
    loadAssets();
  }

  render() {
    const { assets } = this.props;

    return (
      <TabContentWrapper maxWidth={400}>
        <Button
          wide
          onClick={() => {
            openModal();
          }}
        >
          <Icon icon={plusIcon} className="space-right" />
          <span className="v-align">{__('Create new asset')}</span>
        </Button>

        <div className="mt1">
          {!!assets && assets.length > 0 ? (
            assets.map(asset => <Asset key={asset.address} asset={asset} />)
          ) : (
            <EmptyMessage>{__("You don't own any asset")}</EmptyMessage>
          )}
        </div>
      </TabContentWrapper>
    );
  }
}
