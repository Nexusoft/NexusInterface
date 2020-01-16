import React from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

import Icon from 'components/Icon';
import Button from 'components/Button';
import { switchUserTab } from 'lib/ui';
import { loadNameRecords } from 'lib/user';
import { openModal } from 'lib/ui';
import { timing } from 'styles';
import plusIcon from 'icons/plus.svg';

import NameDetailsModal from './NameDetailsModal';
import CreateNameModal from './CreateNameModal';
import TabContentWrapper from '../TabContentWrapper';

__ = __context('User.Names');

const Item = styled.div({
  padding: '10px 20px',
});

const NameComponent = styled(Item)(({ theme }) => ({
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

const Type = styled.span(({ theme }) => ({
  textTransform: 'uppercase',
  fontSize: '.75em',
  color: theme.mixer(0.75),
  background: theme.mixer(0.05),
  padding: '.1em .3em',
  borderRadius: 4,
  whiteSpace: 'nowrap',
  flexShrink: 0,
  marginLeft: '1em',
}));

const Prefix = styled.span(({ theme }) => ({
  color: theme.mixer(0.5),
}));

const EmptyMessage = styled(Item)(({ theme }) => ({
  fontStyle: 'italic',
  color: theme.mixer(0.5),
}));

const Name = ({ nameRecord, username }) => (
  <NameComponent
    onClick={() => {
      openModal(NameDetailsModal, {
        nameRecord,
      });
    }}
  >
    <span>
      {!!nameRecord.namespace ? (
        <Prefix>{nameRecord.namespace}::</Prefix>
      ) : !nameRecord.global ? (
        <Prefix>{username}:</Prefix>
      ) : null}
      {nameRecord.name}
    </span>
    <Type>
      {nameRecord.global
        ? __('Global')
        : nameRecord.namespace
        ? __('Namespaced')
        : __('Local')}
    </Type>
  </NameComponent>
);

@connect(state => ({
  nameRecords: state.core.nameRecords,
  username: state.core.userStatus && state.core.userStatus.username,
}))
export default class Names extends React.Component {
  constructor(props) {
    super(props);
    switchUserTab('Names');
  }

  componentDidMount() {
    loadNameRecords();
  }

  render() {
    const { nameRecords, username } = this.props;

    return (
      <TabContentWrapper maxWidth={500}>
        <Button
          wide
          onClick={() => {
            openModal(CreateNameModal);
          }}
        >
          <Icon icon={plusIcon} className="space-right" />
          <span className="v-align">{__('Create new name')}</span>
        </Button>

        <div className="mt1">
          {!!nameRecords && nameRecords.length > 0 ? (
            nameRecords.map(nameRecord => (
              <Name
                key={nameRecord.address}
                nameRecord={nameRecord}
                username={username}
              />
            ))
          ) : (
            <EmptyMessage>{__("You don't own any names")}</EmptyMessage>
          )}
        </div>
      </TabContentWrapper>
    );
  }
}
