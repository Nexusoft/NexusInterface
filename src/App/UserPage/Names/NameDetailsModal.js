import React from 'react';

import Modal from 'components/Modal';
import InfoField from 'components/InfoField';
import { formatDateTime } from 'lib/intl';

__ = __context('NameDetails');

const timeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
};

const NameDetailsModal = ({ nameRecord }) => (
  <Modal>
    <Modal.Header className="relative">{__('Name Details')}</Modal.Header>
    <Modal.Body>
      <InfoField label={__('Name')}>{nameRecord.name}</InfoField>
      <InfoField label={__('Type')}>
        {nameRecord.global
          ? __('Global')
          : nameRecord.namespace
          ? __('Namespaced')
          : __('Local')}
      </InfoField>
      {!!nameRecord.namespace && (
        <InfoField label={__('Namespace')}>{nameRecord.namespace}</InfoField>
      )}
      <InfoField label={__('Address')}>{nameRecord.address}</InfoField>
      <InfoField label={__('Points to')}>
        {nameRecord.register_address}
      </InfoField>
      <InfoField label={__('Created at')}>
        {formatDateTime(nameRecord.created * 1000, timeFormatOptions)}
      </InfoField>
      <InfoField label={__('Last modified')}>
        {formatDateTime(nameRecord.modified * 1000, timeFormatOptions)}
      </InfoField>
    </Modal.Body>
  </Modal>
);

export default NameDetailsModal;
