import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useAtomValue } from 'jotai';
import styled from '@emotion/styled';

import Icon from 'components/Icon';
import Button from 'components/Button';
import Switch from 'components/Switch';
import { switchUserTab, openModal } from 'lib/ui';
import { nameRecordsQuery } from 'lib/user';
import { usernameAtom } from 'lib/session';
import { updateSettings } from 'lib/settings';
import { popupContextMenu } from 'lib/contextMenu';
import { timing } from 'styles';
import memoize from 'utils/memoize';
import plusIcon from 'icons/plus.svg';

import NameDetailsModal from './NameDetailsModal';
import CreateNameModal from './CreateNameModal';
import ChangeRegisterAddressModal from './ChangeRegisterAddressModal';
import TransferNameModal from './TransferNameModal';
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

const Types = styled.div({
  flexShrink: 0,
  display: 'flex',
});

const Type = styled.span(({ theme }) => ({
  textTransform: 'uppercase',
  fontSize: '.75em',
  color: theme.mixer(0.75),
  background: theme.mixer(0.05),
  padding: '.1em .3em',
  borderRadius: 4,
  whiteSpace: 'nowrap',
  marginLeft: '1em',
}));

const Prefix = styled.span(({ theme }) => ({
  color: theme.mixer(0.5),
}));

const EmptyMessage = styled(Item)(({ theme }) => ({
  fontStyle: 'italic',
  color: theme.mixer(0.5),
}));

function Name({ nameRecord, username }) {
  return (
    <NameComponent
      onClick={() => {
        openModal(NameDetailsModal, {
          nameRecord,
        });
      }}
      onContextMenu={(e) => {
        e.stopPropagation();
        const template = [
          {
            id: 'view-details',
            label: __('View name details'),
            click: () => {
              openModal(NameDetailsModal, { nameRecord });
            },
          },
          {
            id: 'change-register-address',
            label: __('Change register address'),
            click: () => {
              openModal(ChangeRegisterAddressModal, { nameRecord });
            },
          },
        ];
        if (nameRecord.global || nameRecord.namespace) {
          template.push({
            id: 'transfer',
            label: __('Transfer name'),
            click: () => {
              openModal(TransferNameModal, { nameRecord });
            },
          });
        }
        popupContextMenu(template);
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
      <Types>
        {!(nameRecord.register && nameRecord.register !== '0') && (
          <Type>{__('Unused')}</Type>
        )}
        <Type>
          {nameRecord.global
            ? __('Global')
            : nameRecord.namespace
            ? __('Namespaced')
            : __('Local')}
        </Type>
      </Types>
    </NameComponent>
  );
}

const filterNames = memoize((nameRecords, showUnusedNames) =>
  showUnusedNames
    ? nameRecords
    : nameRecords?.filter((nr) => nr.register && nr.register !== '0')
);

export default function Names() {
  const nameRecords = nameRecordsQuery.use();
  const showUnusedNames = useSelector(
    (state) => state.settings.showUnusedNames
  );
  const filteredNames = filterNames(nameRecords, showUnusedNames);
  const username = useAtomValue(usernameAtom);
  useEffect(() => {
    switchUserTab('Names');
  }, []);

  const toggle = () => updateSettings({ showUnusedNames: !showUnusedNames });

  return (
    <TabContentWrapper maxWidth={500}>
      <Button
        wide
        onClick={() => {
          openModal(CreateNameModal);
        }}
      >
        <Icon icon={plusIcon} className="mr0_4" />
        <span className="v-align">{__('Create new name')}</span>
      </Button>

      <div className="mt2">
        <div className="flex center">
          <Switch
            style={{ fontSize: '.7em' }}
            value={showUnusedNames}
            onChange={toggle}
          />
          <span className="pointer ml0_4" onClick={toggle}>
            {__('Show unused names')}
          </span>
        </div>

        <div className="mt1">
          {!!filteredNames && filteredNames.length > 0 ? (
            filteredNames.map((nameRecord) => (
              <Name
                key={nameRecord.address}
                nameRecord={nameRecord}
                username={username}
              />
            ))
          ) : (
            <EmptyMessage>{__("You don't own any name")}</EmptyMessage>
          )}
        </div>
      </div>
    </TabContentWrapper>
  );
}
