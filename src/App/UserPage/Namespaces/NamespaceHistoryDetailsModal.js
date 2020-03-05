import React from 'react';

import Modal from 'components/Modal';
import InfoField from 'components/InfoField';
import { formatDateTime } from 'lib/intl';

__ = __context('NamespaceHistoryDetails');

const timeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
};

const NamespaceHistoryDetailsModal = ({
  event: { type, owner, modified, address, checksum, name },
}) => (
  <Modal>
    <Modal.Header className="relative">
      {__('Namespace History Event')}
    </Modal.Header>

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
      <InfoField label={__('Address')}>{address}</InfoField>
    </Modal.Body>
  </Modal>
);

export default NamespaceHistoryDetailsModal;
