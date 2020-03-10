import React from 'react';

import Modal from 'components/Modal';
import InfoField from 'components/InfoField';
import { formatDateTime } from 'lib/intl';

__ = __context('NameHistoryDetails');

const timeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
};

const NameHistoryDetailsModal = ({
  event: {
    type,
    owner,
    modified,
    address,
    register_address,
    checksum,
    name,
    namespace,
  },
}) => (
  <Modal>
    <Modal.Header className="relative">{__('Name History Event')}</Modal.Header>

    <Modal.Body>
      <InfoField label={__('Type')}>{type}</InfoField>
      <InfoField label={__('Time')}>
        {formatDateTime(modified * 1000, timeFormatOptions)}
      </InfoField>
      <InfoField label={__('Owner')}>{owner}</InfoField>
      <InfoField label={__('Checksum')}>{checksum}</InfoField>
      <InfoField label={__('Name')}>
        {name || <span className="dim">N/A</span>}
      </InfoField>
      <InfoField label={__('Namespace')}>
        {namespace || <span className="dim">N/A</span>}
      </InfoField>
      <InfoField label={__('Address')}>{address}</InfoField>
      <InfoField label={__('Points to')}>{register_address}</InfoField>
    </Modal.Body>
  </Modal>
);

export default NameHistoryDetailsModal;
