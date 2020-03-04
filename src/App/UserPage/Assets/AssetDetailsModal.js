import React from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

import Modal from 'components/Modal';
import Button from 'components/Button';
import Icon from 'components/Icon';
import Tooltip from 'components/Tooltip';
import InfoField from 'components/InfoField';
import { formatDateTime } from 'lib/intl';
import { openModal } from 'lib/ui';
import { fetchAssetSchema } from 'lib/asset';
import { getAssetData } from 'utils/misc';
import editIcon from 'icons/edit.svg';

import EditAssetModal from './EditAssetModal';
import TransferAssetModal from './TransferAssetModal';
import AssetHistoryModal from './AssetHistoryModal';

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

const isEditable = schema =>
  !!Array.isArray(schema) && schema.some(field => field.mutable);

@connect(({ user: { status }, assetSchemas }, props) => {
  const genesisId = status && status.genesis;
  return {
    isOwner: !!genesisId && genesisId === props.asset.owner,
    schema: assetSchemas[props.asset.address],
  };
})
export default class AssetDetailsModal extends React.Component {
  componentDidMount() {
    const { asset, schema, isOwner } = this.props;
    if (!schema && isOwner) {
      fetchAssetSchema(asset.address);
    }
  }

  render() {
    const { asset, schema, isOwner } = this.props;
    const data = getAssetData(asset);

    return (
      <Modal
        assignClose={close => {
          this.closeModal = close;
        }}
      >
        <Modal.Header className="relative">
          {__('Asset Details')}
          {isOwner && isEditable(schema) && (
            <EditAsset>
              <Tooltip.Trigger tooltip={__('Edit asset')}>
                <Button
                  skin="plain"
                  onClick={() => {
                    this.closeModal();
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
        </Modal.Header>

        <Modal.Body>
          <InfoField label={__('Name')}>
            {asset.name || <span className="dim">N/A</span>}
          </InfoField>
          <InfoField label={__('Address')}>{asset.address}</InfoField>
          <InfoField label={__('Owner')}>{asset.owner}</InfoField>
          {!!asset.ownership && (
            <InfoField label={__('Ownership')}>{asset.ownership}%</InfoField>
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

          {isOwner && (
            <div className="mt2 flex space-between">
              <div />
              <div>
                <Button
                  className="space-right"
                  onClick={() => {
                    openModal(AssetHistoryModal, { asset });
                  }}
                >
                  {__('View history')}
                </Button>
                <Button
                  onClick={() => {
                    this.closeModal();
                    openModal(TransferAssetModal, { asset });
                  }}
                >
                  {__('Transfer ownership')}
                </Button>
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>
    );
  }
}
