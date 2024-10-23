import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import styled from '@emotion/styled';

import Icon from 'components/Icon';
import Button from 'components/Button';
import { switchUserTab, openModal } from 'lib/ui';
import { popupContextMenu } from 'lib/contextMenu';
import { refreshNamespaces } from 'lib/user';
import { timing } from 'styles';
import plusIcon from 'icons/plus.svg';

import NamespaceDetailsModal from './NamespaceDetailsModal';
import CreateNamespaceModal from './CreateNamespaceModal';
import TransferNamespaceModal from './TransferNamespaceModal';
import TabContentWrapper from '../TabContentWrapper';

__ = __context('User.Namespaces');

const Item = styled.div({
  padding: '10px 20px',
});

const NamespaceComponent = styled(Item)(({ theme }) => ({
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
      {namespace.namespace}
    </NamespaceComponent>
  );
}

export default function Namespaces() {
  const session = useSelector((state) => state.user.session);
  const namespaces = useSelector((state) => state.user.namespaces);
  useEffect(() => {
    switchUserTab('Namespaces');
    refreshNamespaces();
  }, [session]);

  return (
    <TabContentWrapper maxWidth={400}>
      <div>
        <Button
          wide
          onClick={() => {
            openModal(CreateNamespaceModal);
          }}
        >
          <Icon icon={plusIcon} className="mr0_4" />
          <span className="v-align">{__('Create new namespace')}</span>
        </Button>

        <div className="mt1">
          {!!namespaces && namespaces.length > 0 ? (
            namespaces.map((namespace) => (
              <Namespace key={namespace.address} namespace={namespace} />
            ))
          ) : (
            <EmptyMessage>{__("You don't own any namespace")}</EmptyMessage>
          )}
        </div>
      </div>
    </TabContentWrapper>
  );
}
