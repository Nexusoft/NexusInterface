import React from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

import Icon from 'components/Icon';
import { switchUserTab } from 'lib/ui';
import { loadNameRecords, loadNamespaces } from 'lib/user';
import { openModal } from 'lib/ui';
import { timing } from 'styles';
import plusIcon from 'icons/plus.svg';

import TabContentWrapper from '../TabContentWrapper';

__ = __context('User.Names');

const NamesLayout = styled.div({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  columnGap: 10,
});

const Item = styled.div({
  padding: '10px 20px',
});

const Title = styled(Item)(({ theme }) => ({
  fontSize: 20,
  color: theme.primary,
}));

const Record = styled(Item)(({ theme }) => ({
  color: theme.foreground,
  transitionProperty: 'background, color',
  transitionDuration: timing.normal,
  cursor: 'pointer',
  '&:hover': {
    background: theme.mixer(0.05),
  },
}));

const CreateButton = styled(Record)(({ theme }) => ({
  color: theme.mixer(0.75),
  '&:hover': {
    color: theme.foreground,
  },
}));

const EmptyMessage = styled(Item)(({ theme }) => ({
  fontStyle: 'italic',
  color: theme.mixer(0.5),
}));

@connect(state => ({
  nameRecords: state.core.nameRecords,
  namespaces: state.core.namespaces,
}))
export default class Names extends React.Component {
  constructor(props) {
    super(props);
    switchUserTab('Names');
  }

  componentDidMount() {
    loadNameRecords();
    loadNamespaces();
  }

  render() {
    const { nameRecords, namespaces } = this.props;

    return (
      <TabContentWrapper maxWidth={600}>
        <NamesLayout>
          <div>
            <Title>{__('Names')}</Title>
            <div>
              {!!nameRecords && nameRecords.length > 0 ? (
                nameRecords.map(nameRecord => (
                  <Record key={nameRecord.name}>{nameRecord.name}</Record>
                ))
              ) : (
                <EmptyMessage>{__("You don't own any names")}</EmptyMessage>
              )}
            </div>
            <CreateButton>
              <Icon
                icon={plusIcon}
                className="space-right"
                style={{ fontSize: '.8em' }}
              />
              <span className="v-align">{__('Create new name')}</span>
            </CreateButton>
          </div>

          <div>
            {!!nameRecords && (
              <>
                <Title>{__('Namespaces')}</Title>
                <div>
                  {!!namespaces && namespaces.length > 0 ? (
                    namespaces.map(namespace => (
                      <Record key={namespace.name}>{namespace.name}</Record>
                    ))
                  ) : (
                    <EmptyMessage>
                      {__("You don't own any namespaces")}
                    </EmptyMessage>
                  )}
                </div>
                <CreateButton>
                  <Icon
                    icon={plusIcon}
                    className="space-right"
                    style={{ fontSize: '.8em' }}
                  />
                  <span className="v-align">{__('Create new namespace')}</span>
                </CreateButton>
              </>
            )}
          </div>
        </NamesLayout>
      </TabContentWrapper>
    );
  }
}
