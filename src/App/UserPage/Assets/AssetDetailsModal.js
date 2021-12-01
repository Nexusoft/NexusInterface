import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import styled from '@emotion/styled';

import ControlledModal from 'components/ControlledModal';
import Button from 'components/Button';
import Icon from 'components/Icon';
import Tooltip from 'components/Tooltip';
import InfoField from 'components/InfoField';
import { formatDateTime } from 'lib/intl';
import { openModal } from 'lib/ui';
import { fetchAssetSchema } from 'lib/asset';
import { getAssetData } from 'lib/asset';
import editIcon from 'icons/edit.svg';

import EditAssetModal from './EditAssetModal';
import TransferAssetModal from './TransferAssetModal';
import AssetHistoryModal from './AssetHistoryModal';
import TokenizeAssetModal from './TokenizeAssetModal';

__ = __context('AssetDetails');

const timeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
};

const EditAsset = styled.div({
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  fontSize: '1rem',
});

const isEditable = (schema) =>
  !!Array.isArray(schema) && schema.some((field) => field.mutable);

export default function AssetDetailsModal({ asset }) {
  const isOwner = useSelector(
    (state) => !!asset?.owner && state.user.status?.genesis === asset.owner
  );
  const schema = useSelector((state) => state.assetSchemas[asset?.address]);
  const data = getAssetData(asset);

  useEffect(() => {
    if (!schema && isOwner) {
      fetchAssetSchema(asset.address);
    }
  }, []);

  return (
    <ControlledModal>
      {(closeModal) => (
        <>
          <ControlledModal.Header className="relative">
            {__('Asset Details')}
            {isOwner && isEditable(schema) && (
              <EditAsset>
                <Tooltip.Trigger tooltip={__('Edit asset')}>
                  <Button
                    skin="plain"
                    onClick={() => {
                      closeModal();
                      openModal(EditAssetModal, {
                        schema,
                        asset: asset,
                      });
                    }}
                  >
                    <Icon icon={editIcon} />
                  </Button>
                </Tooltip.Trigger>
              </EditAsset>
            )}
          </ControlledModal.Header>

          {!!asset && (
            <ControlledModal.Body>
              <InfoField label={__('Name')}>
                {asset.name || <span className="dim">N/A</span>}
              </InfoField>
              <InfoField label={__('Address')}>{asset.address}</InfoField>
              <InfoField label={__('Owner')}>{asset.owner}</InfoField>
              {!!asset.ownership && (
                <InfoField label={__('Ownership')}>
                  {asset.ownership}%
                </InfoField>
              )}
              <InfoField label={__('Created at')}>
                {formatDateTime(asset.created * 1000, timeFormatOptions)}
              </InfoField>
              <InfoField label={__('Last modified')}>
                {formatDateTime(asset.modified * 1000, timeFormatOptions)}
              </InfoField>

              {Object.entries(data).map(([key, value]) => (
                <InfoField key={key} label={key}>
                  {value}
                </InfoField>
              ))}

              <div className="mt2 flex space-between">
                <div>
                  <Button
                    className="mr0_4"
                    onClick={() => {
                      closeModal();
                      openModal(AssetHistoryModal, { asset });
                    }}
                  >
                    {__('View history')}
                  </Button>
                </div>
                {isOwner && (
                  <div>
                    {asset.ownership === undefined && (
                      <Button
                        className="mr0_4"
                        onClick={() => {
                          closeModal();
                          openModal(TokenizeAssetModal, { asset });
                        }}
                      >
                        {__('Tokenize')}
                      </Button>
                    )}
                    <Button
                      onClick={() => {
                        closeModal();
                        openModal(TransferAssetModal, { asset });
                      }}
                    >
                      {__('Transfer ownership')}
                    </Button>
                  </div>
                )}
              </div>
            </ControlledModal.Body>
          )}
        </>
      )}
    </ControlledModal>
  );
}
