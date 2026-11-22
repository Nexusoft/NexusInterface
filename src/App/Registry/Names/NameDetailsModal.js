import styled from '@emotion/styled';

import ControlledModal from 'components/ControlledModal';
import Button from 'components/Button';
import Icon from 'components/Icon';
import Tooltip from 'components/Tooltip';
import { clipboard } from 'electron';
import { fade } from 'utils/color';
import { showNotification } from 'lib/ui';
import copyIcon from 'icons/copy.svg';
import historyIcon from 'icons/history.svg';
import RegistryIcon from '../RegistryIcon';
import QRButton from 'components/QRButton';
import { formatDateTime } from 'lib/intl';
import { openModal } from 'lib/ui';
import editIcon from 'icons/edit.svg';

import ChangeRegisterAddressModal from './ChangeRegisterAddressModal';
import TransferNameModal from './TransferNameModal';
import NameHistoryModal from './NameHistoryModal';

__ = __context('NameDetails');

const timeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
};

const Heading = styled.div(({ theme }) => ({
  display: 'flex', alignItems: 'center', gap: 14,
  '.name-icon': { display: 'grid', placeItems: 'center', width: 48, height: 48, flexShrink: 0, borderRadius: 14, color: theme.primary, background: fade(theme.primary, 0.9) },
  '.identity': { minWidth: 0, flex: 1 },
  '.eyebrow': { fontSize: 11, letterSpacing: 1, color: theme.mixer(0.65), marginBottom: 4 },
  h2: { margin: 0, fontSize: 25, fontWeight: 500, lineHeight: 1.3, overflowWrap: 'anywhere', color: theme.foreground },
  '.type': { border: `1px solid ${fade(theme.primary, 0.7)}`, borderRadius: 20, padding: '4px 10px', fontSize: 11, color: theme.primary, flexShrink: 0 },
  '@media (max-width: 480px)': { flexWrap: 'wrap', h2: { fontSize: 21 } },
}));

const Details = styled.div(({ theme }) => ({
  display: 'grid', gap: 16,
  '.address-card': { padding: 16, borderRadius: 12, border: `1px solid ${fade(theme.primary, 0.8)}`, background: fade(theme.primary, 0.97) },
  '.label': { margin: '0 0 10px', fontSize: 11, fontWeight: 500, color: theme.mixer(0.65) },
  '.address-row': { display: 'flex', alignItems: 'center', gap: 12 },
  code: { flex: 1, minWidth: 0, fontSize: 13, lineHeight: 1.7, overflowWrap: 'anywhere', userSelect: 'text', color: theme.foreground },
  '.address-actions': { display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 },
  '.address-actions button': { width: 34, height: 34, minHeight: 34, padding: 8, borderRadius: 8 },
  '.metadata': { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 20, margin: 0, padding: '4px 0' },
  dt: { fontSize: 11, color: theme.mixer(0.6), marginBottom: 6 },
  dd: { margin: 0, fontSize: 13, lineHeight: 1.6, overflowWrap: 'anywhere' },
  '.namespace': { gridColumn: '1 / -1' },
  '@media (max-width: 520px)': { '.metadata': { gridTemplateColumns: 'minmax(0, 1fr)' }, '.address-row': { flexWrap: 'wrap' }, code: { flexBasis: '100%' }, '.address-actions': { marginLeft: 'auto' } },
}));

const Actions = styled.div({
  display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: 10,
  button: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 40, height: 'auto', whiteSpace: 'normal' },
});

function AddressCard({ label, address }) {
  return <section className="address-card">
    <h3 className="label">{label}</h3>
    <div className="address-row"><code>{address}</code><div className="address-actions">
      <Tooltip.Trigger tooltip={__('Copy address')}><Button skin="plain" aria-label={__('Copy address')} onClick={() => { clipboard.writeText(address); showNotification(__('Address has been copied to clipboard'), 'success'); }}><Icon icon={copyIcon} /></Button></Tooltip.Trigger>
      <QRButton address={address} />
    </div></div>
  </section>;
}

export default function NameDetailsModal({ nameRecord }) {
  const type = nameRecord.global ? __('Global') : nameRecord.namespace ? __('Namespaced') : __('Local');
  return <ControlledModal maxWidth={760}>
    {(closeModal) => {
      const openDetails = (Modal) => { closeModal(); openModal(Modal, { nameRecord }); };
      return <>
        <ControlledModal.Header>
          <Heading>
            <span className="name-icon"><RegistryIcon section="Names" size={26} /></span>
            <div className="identity"><div className="eyebrow">{__('Name Details')}</div><h2>{nameRecord.name}</h2></div>
            <span className="type">{type}</span>
          </Heading>
        </ControlledModal.Header>
        <ControlledModal.Body>
          <Details>
            <AddressCard label={__('Address')} address={nameRecord.address} />
            <AddressCard label={__('Points to')} address={nameRecord.register} />
            <dl className="metadata">
              {!!nameRecord.namespace && <div className="namespace"><dt>{__('Namespace')}</dt><dd>{nameRecord.namespace}</dd></div>}
              <div><dt>{__('Created at')}</dt><dd>{formatDateTime(nameRecord.created * 1000, timeFormatOptions)}</dd></div>
              <div><dt>{__('Last modified')}</dt><dd>{formatDateTime(nameRecord.modified * 1000, timeFormatOptions)}</dd></div>
            </dl>
          </Details>
        </ControlledModal.Body>
        <ControlledModal.Footer separator>
          <Actions>
            <Button skin="primary" onClick={() => openDetails(NameHistoryModal)}><Icon icon={historyIcon} />{__('View history')}</Button>
            {(!!nameRecord.global || !!nameRecord.namespace) && <Button skin="primary" onClick={() => openDetails(TransferNameModal)}>{__('Transfer ownership')}</Button>}
            <Button skin="filled-primary" onClick={() => openDetails(ChangeRegisterAddressModal)}><Icon icon={editIcon} />{__('Change register address')}</Button>
          </Actions>
        </ControlledModal.Footer>
      </>;
    }}
  </ControlledModal>;
}
