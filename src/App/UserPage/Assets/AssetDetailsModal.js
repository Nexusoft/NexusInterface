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
import { getAssetData } from 'utils/misc';
import editIcon from 'icons/edit.svg';

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

@connect(({ user: { status } }) => ({
  genesisId: status && status.genesis,
}))
export default class AssetDetailsModal extends React.Component {
  render() {
    const { asset, genesisId } = this.props;
    const isOwner = !!genesisId && genesisId === asset.owner;
    const data = getAssetData(asset);

    return (
      <Modal>
        {closeModal => (
          <>
            <Modal.Header className="relative">
              {__('Asset Details')}
              {isOwner && (
                <EditAsset>
                  <Tooltip.Trigger tooltip={__('Edit asset')}>
                    <Button
                      skin="plain"
                      onClick={() => {
                        closeModal();
                        openModal();
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

              {isOwner && (
                <div className="mt2 flex space-between">
                  <div />
                  <Button>{__('Transfer ownership')}</Button>
                </div>
              )}
            </Modal.Body>
          </>
        )}
      </Modal>
    );
  }
}
