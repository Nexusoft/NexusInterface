import React from 'react';
import styled from '@emotion/styled';

import Modal from 'components/Modal';
import Button from 'components/Button';
import Icon from 'components/Icon';
import Tooltip from 'components/Tooltip';
import InfoField from 'components/InfoField';
import { formatDateTime } from 'lib/intl';
import editIcon from 'icons/edit.svg';

__ = __context('NameDetails');

const timeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
};

const EditName = styled.div({
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  fontSize: '1rem',
});

const NameDetailsModal = ({ nameRecord }) => (
  <Modal>
    <Modal.Header className="relative">
      {__('Name Details')}
      <EditName>
        <Tooltip.Trigger tooltip={__('Edit')}>
          <Button skin="plain">
            <Icon icon={editIcon} />
          </Button>
        </Tooltip.Trigger>
      </EditName>
    </Modal.Header>
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

      <div className="mt2 flex space-between">
        <div />
        <Button>{__('Transfer name ownership')}</Button>
      </div>
    </Modal.Body>
  </Modal>
);

export default NameDetailsModal;
