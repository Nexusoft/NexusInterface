import React from 'react';
import styled from '@emotion/styled';

import Modal from 'components/Modal';
import Button from 'components/Button';
import Icon from 'components/Icon';
import Tooltip from 'components/Tooltip';
import InfoField from 'components/InfoField';
import { formatDateTime } from 'lib/intl';
import editIcon from 'icons/edit.svg';

__ = __context('NamespaceDetails');

const timeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
};

const EditNamespace = styled.div({
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  fontSize: '1rem',
});

const NamespaceDetailsModal = ({ namespace }) => (
  <Modal>
    <Modal.Header className="relative">
      {__('Namespace Details')}
      <EditNamespace>
        <Tooltip.Trigger tooltip={__('Edit')}>
          <Button skin="plain">
            <Icon icon={editIcon} />
          </Button>
        </Tooltip.Trigger>
      </EditNamespace>
    </Modal.Header>
    <Modal.Body>
      <InfoField label={__('Name')}>{namespace.name}</InfoField>
      <InfoField label={__('Address')}>{namespace.address}</InfoField>
      <InfoField label={__('Created at')}>
        {formatDateTime(namespace.created * 1000, timeFormatOptions)}
      </InfoField>
      <InfoField label={__('Last modified')}>
        {formatDateTime(namespace.modified * 1000, timeFormatOptions)}
      </InfoField>

      <div className="mt2 flex space-between">
        <div />
        <Button>{__('Transfer namespace ownership')}</Button>
      </div>
    </Modal.Body>
  </Modal>
);

export default NamespaceDetailsModal;
