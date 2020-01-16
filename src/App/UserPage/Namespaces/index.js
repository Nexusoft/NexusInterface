import React from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

import Icon from 'components/Icon';
import Button from 'components/Button';
import { switchUserTab } from 'lib/ui';
import { popupContextMenu } from 'lib/contextMenu';
import { loadNamespaces } from 'lib/user';
import { openModal } from 'lib/ui';
import { timing } from 'styles';
import plusIcon from 'icons/plus.svg';

import NamespaceDetailsModal from './NamespaceDetailsModal';
import CreateNamespaceModal from './CreateNamespaceModal';
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

const Namespace = ({ namespace }) => (
  <NamespaceComponent
    onClick={() => {
      openModal(NamespaceDetailsModal, {
        namespace,
      });
    }}
    onContextMenu={e => {
      e.stopPropagation();
      popupContextMenu([
        {
          id: 'view-details',
          label: __('View name details'),
          click: () => {
            openModal(NamespaceDetailsModal, { namespace });
          },
        },
      ]);
    }}
  >
    {namespace.name}
  </NamespaceComponent>
);

@connect(state => ({
  namespaces: state.core.namespaces,
}))
export default class Namesspaces extends React.Component {
  constructor(props) {
    super(props);
    switchUserTab('Namespaces');
  }

  componentDidMount() {
    loadNamespaces();
  }

  render() {
    const { namespaces } = this.props;

    return (
      <TabContentWrapper maxWidth={400}>
        <div>
          <Button
            wide
            onClick={() => {
              openModal(CreateNamespaceModal);
            }}
          >
            <Icon icon={plusIcon} className="space-right" />
            <span className="v-align">{__('Create new namespace')}</span>
          </Button>

          <div className="mt1">
            {!!namespaces && namespaces.length > 0 ? (
              namespaces.map(namespace => (
                <Namespace key={namespace.address} namespace={namespace} />
              ))
            ) : (
              <EmptyMessage>{__("You don't own any namespaces")}</EmptyMessage>
            )}
          </div>
        </div>
      </TabContentWrapper>
    );
  }
}
