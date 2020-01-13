// External
import React from 'react';
import styled from '@emotion/styled';
import { join } from 'path';

// Internal
import Modal from 'components/Modal';
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

const Row = styled.div({
  display: 'grid',
  gridTemplateAreas: '"label value"',
  gridTemplateColumns: '1fr 2fr',
  alignItems: 'start',
  columnGap: '1em',
  marginBottom: '.6em',
});

const Label = styled.div(({ theme }) => ({
  gridArea: 'label',
  textAlign: 'right',
  color: theme.mixer(0.875),
}));

const Value = styled.div({
  gridArea: 'value',
  wordBreak: 'break-word',
});

const Field = ({ label, children }) => (
  <Row>
    <Label>{label}</Label>
    <Value>{children}</Value>
  </Row>
);

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
          <Field label={__('Name')}>{nameRecord.name}</Field>
          <Field label={__('Type')}>
            {nameRecord.global
              ? __('global')
              : nameRecord.namespace
              ? __('namespaced')
              : __('local')}
          </Field>
          {!!nameRecord.namespace && (
            <Field label={__('Namespace')}>{nameRecord.namespace}</Field>
          )}
          <Field label={__('Name address')}>{nameRecord.address}</Field>
          <Field label={__('Points to')}>{nameRecord.register_address}</Field>
          <Field label={__('Created at')}>
            {formatDateTime(nameRecord.created * 1000, timeFormatOptions)}
          </Field>
          <Field label={__('Last modified')}>
            {formatDateTime(nameRecord.modified * 1000, timeFormatOptions)}
          </Field>
        </Modal.Body>
      </Modal>
    );
  }
}
