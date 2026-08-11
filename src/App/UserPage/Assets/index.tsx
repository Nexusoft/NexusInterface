import styled from '@emotion/styled';

import Icon from 'components/Icon';
import Button from 'components/Button';
import { openModal } from 'lib/ui';
import { assetsQuery } from 'lib/user';
import plusIcon from 'icons/plus.svg';

import { useUserTab } from '../atoms';
import Asset from './Asset';
import CreateAssetModal from './CreateAssetModal';
import TabContentWrapper from '../TabContentWrapper';

__ = __context('User.Assets');

const EmptyMessage = styled.div(({ theme }) => ({
  padding: '10px 20px',
  fontStyle: 'italic',
  color: theme.mixer(0.5),
}));

export default function Assets() {
  useUserTab('Assets');
  const assets = assetsQuery.use();

  return (
    <TabContentWrapper maxWidth={400}>
      <Button
        wide
        onClick={() => {
          openModal(CreateAssetModal);
        }}
      >
        <Icon icon={plusIcon} className="mr0_4" />
        <span className="v-align">{__('Create new asset')}</span>
      </Button>

      <div className="mt1">
        {!!assets && assets.length > 0 ? (
          assets.map((asset) => <Asset key={asset.address} asset={asset} />)
        ) : (
          <EmptyMessage>{__("You don't own any asset")}</EmptyMessage>
        )}
      </div>
    </TabContentWrapper>
  );
}
