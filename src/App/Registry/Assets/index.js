import matchesRecord from '../search';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import styled from '@emotion/styled';

import Icon from 'components/Icon';
import Button from 'components/Button';
import { openModal } from 'lib/ui';
import { refreshAssets } from 'lib/user';
import plusIcon from 'icons/plus.svg';

import Asset from './Asset';
import CreateAssetModal from './CreateAssetModal';
import TabContentWrapper from '../TabContentWrapper';

__ = __context('User.Assets');

const EmptyMessage = styled.div(({ theme }) => ({
  padding: '10px 20px',
  fontStyle: 'italic',
  color: theme.mixer(0.5),
}));

export function CreateAssetButton(props) {
  return <Button skin="primary" {...props} onClick={() => openModal(CreateAssetModal)}>
    <Icon icon={plusIcon} className="mr0_4" />
    <span className="v-align">{__('Create new asset')}</span>
  </Button>;
}

export default function Assets({ search = '', hideCreate = false }) {
  const session = useSelector((state) => state.user.session);
  const assets = useSelector((state) => state.user.assets);
  useEffect(() => {
    refreshAssets();
  }, [session]);

  const filtered = assets?.filter((record) => matchesRecord(record, search));

  return (
    <TabContentWrapper maxWidth={400}>
      {!hideCreate && <CreateAssetButton wide />}

      <div className="mt1">
        {!!filtered && filtered.length > 0 ? (
          filtered.map((asset) => <Asset key={asset.address} asset={asset} />)
        ) : (
          <EmptyMessage className="registry-empty">{!assets ? __('Records unavailable or loading...') : search.trim() ? __('No matching records') : __('No assets to display yet.')}</EmptyMessage>
        )}
      </div>
    </TabContentWrapper>
  );
}
