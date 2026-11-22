import matchesRecord from '../search';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import styled from '@emotion/styled';

import Icon from 'components/Icon';
import Button from 'components/Button';
import { openModal } from 'lib/ui';
import { popupContextMenu } from 'lib/contextMenu';
import { refreshNamespaces } from 'lib/user';
import { timing } from 'styles';
import plusIcon from 'icons/plus.svg';

import NamespaceDetailsModal from './NamespaceDetailsModal';
import CreateNamespaceModal from './CreateNamespaceModal';
import TransferNamespaceModal from './TransferNamespaceModal';
import TabContentWrapper from '../TabContentWrapper';
import { RecordField, RecordLabel, RecordCreated } from '../RecordMetadata';

__ = __context('User.Namespaces');

const Item = styled.div({
  padding: '10px 20px',
});

const NamespaceComponent = styled(Item)(({ theme }) => ({
  width: '100%',
  textAlign: 'left',
  font: 'inherit',
  padding: '16px 18px',
  marginTop: 10,
  border: `1px solid ${theme.mixer(0.12)}`,
  borderRadius: 12,
  background: theme.mixer(0.025),
  gap: 12,
  flexWrap: 'wrap',
  overflowWrap: 'anywhere',
  '&:focus-visible': { outline: `2px solid ${theme.primary}`, outlineOffset: 2 },
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  color: theme.foreground,
  transitionProperty: 'background, color',
  transitionDuration: timing.normal,
  cursor: 'pointer',
  '&:hover': {
    background: theme.mixer(0.05),
  },
}));

const EmptyMessage = styled(Item)(({ theme }) => ({
  fontStyle: 'italic',
  color: theme.mixer(0.5),
}));

function Namespace({ namespace }) {
  return (
    <NamespaceComponent
      className="registry-record"
      as="button"
      type="button"
      onClick={() => {
        openModal(NamespaceDetailsModal, {
          namespace,
        });
      }}
      onContextMenu={(e) => {
        e.stopPropagation();
        popupContextMenu([
          {
            id: 'view-details',
            label: __('View name details'),
            click: () => {
              openModal(NamespaceDetailsModal, { namespace });
            },
          },
          {
            id: 'transfer-namespace',
            label: __('Transfer namespace'),
            click: () => {
              openModal(TransferNamespaceModal, { namespace });
            },
          },
        ]);
      }}
    >
      <RecordField className="identity-field">
        <RecordLabel>{__('Namespace')}</RecordLabel>
        <span>{namespace.namespace}</span>
      </RecordField>
      <RecordCreated created={namespace.created} label={__('Created')} unavailable={__('Unavailable')} />
    </NamespaceComponent>
  );
}

export function CreateNamespaceButton(props) {
  return <Button skin="primary" {...props} onClick={() => openModal(CreateNamespaceModal)}>
    <Icon icon={plusIcon} className="mr0_4" />
    <span className="v-align">{__('Create new namespace')}</span>
  </Button>;
}

export default function Namespaces({ search = '', hideCreate = false }) {
  const session = useSelector((state) => state.user.session);
  const namespaces = useSelector((state) => state.user.namespaces);
  useEffect(() => {
    refreshNamespaces();
  }, [session]);

  const filtered = namespaces?.filter((record) => matchesRecord(record, search));

  return (
    <TabContentWrapper maxWidth={400}>
      <div>
      {!hideCreate && <CreateNamespaceButton wide />}

        <div className="mt1">
          {!!filtered && filtered.length > 0 ? (
            filtered.map((namespace) => (
              <Namespace key={namespace.address} namespace={namespace} />
            ))
          ) : (
            <EmptyMessage className="registry-empty">{!namespaces ? __('Records unavailable or loading...') : search.trim() ? __('No matching records') : __('No namespaces to display yet.')}</EmptyMessage>
          )}
        </div>
      </div>
    </TabContentWrapper>
  );
}
