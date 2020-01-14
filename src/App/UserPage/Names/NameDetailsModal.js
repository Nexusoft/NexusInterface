// External
import React from 'react';
import { join } from 'path';

// Internal
import Modal from 'components/Modal';
import InfoField from 'components/InfoField';
import { openConfirmDialog } from 'lib/ui';
import { modulesDir } from 'consts/paths';
import { formatDateTime } from 'lib/intl';
import deleteDirectory from 'utils/promisified/deleteDirectory';

__ = __context('NameDetails');

const timeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
};

export default class NameDetailsModal extends React.Component {
  confirmDelete = () => {
    openConfirmDialog({
      question: `Delete ${this.props.module.displayName}?`,
      callbackYes: async () => {
        const moduleDir = join(modulesDir, this.props.module.dirName);
        await deleteDirectory(moduleDir);
        location.reload();
      },
    });
  };

  render() {
    const { nameRecord } = this.props;
    return (
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
            <InfoField label={__('Namespace')}>
              {nameRecord.namespace}
            </InfoField>
          )}
          <InfoField label={__('Name address')}>{nameRecord.address}</InfoField>
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
  }
}
