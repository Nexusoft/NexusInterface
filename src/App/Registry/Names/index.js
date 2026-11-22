import matchesRecord from '../search';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import styled from '@emotion/styled';

import Icon from 'components/Icon';
import Button from 'components/Button';
import Switch from 'components/Switch';
import { openModal } from 'lib/ui';
import { refreshNameRecords } from 'lib/user';
import { selectUsername } from 'lib/session';
import { updateSettings } from 'lib/settings';
import { popupContextMenu } from 'lib/contextMenu';
import { timing } from 'styles';
import { formatDateTime } from 'lib/intl';
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

const Types = styled.div({
  display: 'flex',
  flexWrap: 'wrap',
  gap: 6,
});

const Field = styled.span({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: 6,
  minWidth: 0,
  '&.name-field': { flex: '1 1 220px' },
  '&.created-field': { flex: '0 1 180px' },
  '&.type-field': { flex: '0 0 110px' },
});

const Label = styled.span(({ theme }) => ({
  fontSize: 11,
  fontWeight: 500,
  color: theme.mixer(0.65),
  lineHeight: 1.4,
}));

const dateFormatOptions = { year: 'numeric', month: 'short', day: '2-digit' };

const Type = styled.span(({ theme }) => ({
  textTransform: 'uppercase',
  fontSize: '.75em',
  color: theme.mixer(0.75),
  background: theme.mixer(0.05),
  padding: '4px 8px',
  borderRadius: 4,
  whiteSpace: 'nowrap',
  marginLeft: 0,
}));

const Prefix = styled.span(({ theme }) => ({
  color: theme.mixer(0.5),
}));

const EmptyMessage = styled(Item)(({ theme }) => ({
  fontStyle: 'italic',
  color: theme.mixer(0.5),
}));

function Name({ nameRecord, username }) {
  const created = Number(nameRecord.created) * 1000;
  const hasCreated = created > 0 && Number.isFinite(new Date(created).getTime());
  return (
    <NameComponent
      className="registry-record"
      as="button"
      type="button"
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
      <Field className="name-field">
        <Label>{__('Name')}</Label>
        <span>
        {!!nameRecord.namespace ? (
          <Prefix>{nameRecord.namespace}::</Prefix>
        ) : !nameRecord.global ? (
          <Prefix>{username}:</Prefix>
        ) : null}
        {nameRecord.name}
        </span>
      </Field>
      <Field className="created-field">
        <Label>{__('Created')}</Label>
        {hasCreated ? (
          <time dateTime={new Date(created).toISOString()}>
            {formatDateTime(created, dateFormatOptions)}
          </time>
        ) : <span>{__('Unavailable')}</span>}
      </Field>
      <Field className="type-field">
        <Label>{__('Type')}</Label>
      <Types as="span">
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
      </Field>
    </NameComponent>
  );
}

const selectNameRecords = memoize(
  (nameRecords, showUnusedNames) =>
    showUnusedNames
      ? nameRecords
      : nameRecords?.filter((nr) => nr.register && nr.register !== '0'),
  (state) => [state.user.nameRecords, state.settings.showUnusedNames]
);

export function CreateNameButton(props) {
  return <Button skin="primary" {...props} onClick={() => openModal(CreateNameModal)}>
    <Icon icon={plusIcon} className="mr0_4" />
    <span className="v-align">{__('Create new name')}</span>
  </Button>;
}

export default function Names({ search = '', hideCreate = false }) {
  const session = useSelector((state) => state.user.session);
  const nameRecords = useSelector(selectNameRecords);
  const username = useSelector(selectUsername);
  const showUnusedNames = useSelector(
    (state) => state.settings.showUnusedNames
  );
  useEffect(() => {
    refreshNameRecords();
  }, [session]);

  const toggle = () => updateSettings({ showUnusedNames: !showUnusedNames });

  const filtered = nameRecords?.filter((record) => matchesRecord(record, search));

  return (
    <TabContentWrapper maxWidth={500}>
      {!hideCreate && <CreateNameButton wide />}

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
          {!!filtered && filtered.length > 0 ? (
            filtered.map((nameRecord) => (
              <Name
                key={nameRecord.address}
                nameRecord={nameRecord}
                username={username}
              />
            ))
          ) : (
            <EmptyMessage className="registry-empty">{!nameRecords ? __('Records unavailable or loading...') : search.trim() ? __('No matching records') : __('No names to display yet.')}</EmptyMessage>
          )}
        </div>
      </div>
    </TabContentWrapper>
  );
}
