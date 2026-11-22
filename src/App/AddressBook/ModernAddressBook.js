import { moduleLayout, modulePanel, moduleAction } from 'utils/moduleStyles';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import styled from '@emotion/styled';
import { clipboard } from 'electron';
import Button from 'components/Button';
import Dropdown from 'components/Dropdown';
import { goToSend } from 'lib/send';
import Icon from 'components/Icon';
import Tooltip from 'components/Tooltip';
import QRButton from 'components/QRButton';
import ExternalLink from 'components/ExternalLink';
import AddEditContactModal from 'components/AddEditContactModal';
import TransactionDetailsModal from 'components/TransactionDetailsModal';
import { openModal, showNotification } from 'lib/ui';
import { confirm, openErrorDialog } from 'lib/dialog';
import { addNewContact, deleteContact, selectContact, searchContact } from 'lib/addressBook';
import { callAPI } from 'lib/api';
import { formatDateTime } from 'lib/intl';
import { isCoreConnected } from 'selectors';
import store from 'store';
import timeZones from 'data/timeZones';
import { fade, mix } from 'utils/color';
import { parseContactImport, exportContacts } from './transfer';
import bookIcon from 'icons/address-book.svg';
import userIcon from 'icons/user.svg';
import profileCardIcon from 'icons/profile-card.svg';
import notesIcon from 'icons/documents.svg';
import historyIcon from 'icons/history.svg';
import searchIcon from 'icons/search.svg';
import plusIcon from 'icons/plus.svg';
import downloadIcon from 'icons/download.svg';
import exportIcon from 'icons/export.svg';
import editIcon from 'icons/edit.svg';
import trashIcon from 'icons/trash.svg';
import copyIcon from 'icons/copy.svg';
import walletIcon from 'icons/wallet.svg';
import sendIcon from 'icons/send.svg';
import emailIcon from 'icons/contact-email.svg';
import phoneIcon from 'icons/contact-phone.svg';
import checkIcon from 'icons/check.svg';
import logoIcon from 'icons/logo.svg';

__ = __context('AddressBook');

const Dashboard = styled.div(({ theme }) => ({
  display: 'flex', flexDirection: 'column', gap: moduleLayout.gap, height: '100%', minHeight: 0, minWidth: 0, containerType: 'inline-size', containerName: 'address-book',
  overflowY: 'auto', overflowX: 'hidden', overscrollBehavior: 'contain',
  fontSize: 13, lineHeight: 1.5,
  '.page-heading': { ...modulePanel(theme), display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', padding: moduleLayout.compactPadding, flexShrink: 0 },
  '.page-title': { display: 'flex', gap: 14, alignItems: 'center', minWidth: 0 },
  h1: { margin: 0, fontSize: moduleLayout.titleSize, lineHeight: 1.3, fontWeight: 600 },
  '.subtitle': { margin: '4px 0 0', color: theme.mixer(0.7), fontSize: 12 },
  '.actions': { display: 'flex', gap: 8, flexWrap: 'wrap' },
  '.actions button': { ...moduleAction, display: 'flex', alignItems: 'center', gap: 6 },
  '.actions button svg': { width: 13, height: 13 },
  '.surface': { ...modulePanel(theme), borderColor: fade(theme.primary, 0.65) },
  '.workspace': { flex: 1, minHeight: 320, display: 'grid', gridTemplateRows: 'minmax(0, 1fr)', gridTemplateColumns: 'minmax(280px, 1fr) minmax(0, 2fr)', gap: moduleLayout.gap },
  '.contacts': { display: 'flex', flexDirection: 'column', minHeight: 0, minWidth: 0, overflow: 'hidden', padding: moduleLayout.panelPadding },
  '.contacts-heading, .list-controls': { flexShrink: 0 },
  '.list-controls': { display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 18 },
  '.search': { display: 'flex', alignItems: 'center', minWidth: 0, flex: '1 1 150px', gap: 10, padding: '0 12px', borderRadius: 9, border: `1px solid ${fade(theme.primary, 0.75)}`, background: fade(theme.background, 0.1) },
  '.search svg': { width: 16, height: 16, flexShrink: 0, color: theme.primary },
  '.search input': { border: 0, outline: 'none', background: 'transparent', color: theme.foreground, width: '100%', minWidth: 0, height: 38, fontSize: 12 },
  '.search:focus-within': { borderColor: theme.primary },
  select: { maxWidth: 140, background: mix(theme.background, theme.primary, 0.06), color: theme.foreground, border: `1px solid ${fade(theme.primary, 0.7)}`, borderRadius: 9, padding: 8, fontSize: 12 },
  '.contact-list': { overflowY: 'auto', minHeight: 0, flex: '1 1 0', overscrollBehavior: 'contain' },
  '.contact': { width: '100%', display: 'flex', alignItems: 'center', gap: 12, borderRadius: 10, padding: '12px 10px', marginBottom: 8, background: 'transparent', border: '1px solid transparent', color: theme.foreground, cursor: 'pointer', textAlign: 'left' },
  '.contact:hover': { background: fade(theme.primary, 0.95) },
  '.contact[aria-pressed="true"]': { borderColor: fade(theme.primary, 0.45), borderLeft: `3px solid ${theme.primary}`, background: fade(theme.primary, 0.88) },
  '.avatar': { display: 'grid', placeItems: 'center', width: 36, height: 36, borderRadius: '50%', background: fade(theme.primary, 0.87), color: theme.primary, flexShrink: 0 },
  '.contact-name': { flex: 1, minWidth: 0, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' },
  '.badge': { color: theme.primary, background: fade(theme.primary, 0.9), borderRadius: 20, padding: '1px 7px', fontSize: 10 },
  '.detail': { minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', containerType: 'inline-size', containerName: 'contact-detail' },
  '.detail-heading': { flexShrink: 0, display: 'flex', alignItems: 'center', gap: 14, padding: moduleLayout.panelPadding },
  '.detail-heading .avatar': { width: 48, height: 48, fontSize: 20 },
  '.detail-heading h2': { minWidth: 0, overflowWrap: 'anywhere', margin: 0, fontSize: moduleLayout.titleSize, fontWeight: 600 },
  '.contact-actions': { display: 'flex', gap: 8, flexShrink: 0 },
  '.tabs': { display: 'flex', padding: '0 20px', borderBottom: `1px solid ${fade(theme.primary, 0.8)}`, overflowX: 'auto', flexShrink: 0 },
  '.tab': { display: 'flex', gap: 8, alignItems: 'center', whiteSpace: 'nowrap', background: 'transparent', border: 0, borderBottom: '2px solid transparent', padding: '12px 16px', color: theme.mixer(0.7), cursor: 'pointer' },
  '.tab[aria-selected="true"]': { color: theme.primary, borderBottomColor: theme.primary },
  '.detail-body': { display: 'flex', flexDirection: 'column', padding: moduleLayout.panelPadding, flex: 1, minHeight: 0, overflowY: 'auto' },
  '.section': { ...modulePanel(theme), flexShrink: 0, padding: 16, marginBottom: 16, '&:last-child': { marginBottom: 0 } },
  '.notes-section': { flexGrow: 1 },
  h3: { display: 'flex', gap: 10, alignItems: 'center', margin: 0, fontSize: moduleLayout.sectionTitleSize, fontWeight: 600, color: theme.foreground },
  '.address-row': { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', padding: '10px 8px', borderRadius: 9, border: `1px solid ${fade(theme.primary, 0.8)}`, background: fade(theme.background, 0.1), marginTop: 10 },
  '.address-label': { maxWidth: '100%', overflowWrap: 'anywhere', border: `1px solid ${fade(theme.primary, 0.4)}` },
  '.address-row code': { minWidth: 0, fontSize: 13, userSelect: 'text', whiteSpace: 'nowrap' },
  '.address-actions': { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginLeft: 'auto' },
  '.info': { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0 24px', margin: 0 },
  '.info > div': { display: 'grid', gridTemplateColumns: 'minmax(95px, .8fr) minmax(0, 1fr)', gap: 12, padding: '12px 0', borderBottom: `1px solid ${fade(theme.primary, 0.87)}` },
  dt: { display: 'flex', alignItems: 'center', gap: 10, color: theme.foreground },
  dd: { margin: 0, minWidth: 0, overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' },
  '.muted': { color: theme.mixer(0.6), fontStyle: 'italic' },
  '.notes': { padding: '10px 0', minHeight: 32, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', margin: 0 },
  '.empty': { padding: 24, textAlign: 'center', color: theme.mixer(0.65) },
  '.activity-row': { display: 'block', width: '100%', padding: 12, textAlign: 'left', height: 'auto', borderBottom: `1px solid ${fade(theme.primary, 0.88)}`, whiteSpace: 'normal' },
  '.contacts-heading': { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 18 },
  '.contacts-heading h2': { margin: 0, fontSize: moduleLayout.sectionTitleSize, fontWeight: 600 },
  '.contacts-heading > span': { color: theme.mixer(0.65), fontSize: 11 },
  '.contact-identity': { flex: 1, minWidth: 0 },
  '.contact-identity p': { margin: '4px 0 0', color: theme.mixer(0.7) },
  '.contact-actions button, .address-actions button': { ...moduleAction, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 },
  '.section-heading': { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', paddingBottom: 12, marginBottom: 6, borderBottom: `1px solid ${fade(theme.primary, 0.75)}` },
  '.section-heading button': { display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, padding: 0 },
  '.section-heading svg, .currency svg': { color: theme.primary, flexShrink: 0 },
  '.info dt svg': { flexShrink: 0, width: 16, height: 16, color: theme.mixer(0.8) },
  '.currency': { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 10px', border: `1px solid ${fade(theme.primary, 0.6)}`, borderRadius: 9 },
  '.currency svg': { width: 22, height: 22 },
  '.contacts-guide': { flexShrink: 0, margin: 'auto 0', padding: '32px 8px', color: theme.mixer(0.7), textAlign: 'center', fontSize: 12 },
  '.contacts-guide > svg': { color: theme.mixer(0.6) },
  '.contacts-guide ul': { display: 'inline-flex', flexDirection: 'column', gap: 12, padding: 0, margin: '12px 0 0', listStyle: 'none', textAlign: 'left' },
  '.contacts-guide li': { display: 'flex', alignItems: 'center', gap: 10 },
  '.contacts-guide li svg': { color: theme.primary, flexShrink: 0 },
  'button:focus-visible, select:focus-visible': { outline: `2px solid ${theme.primary}`, outlineOffset: 3 },
  '@container contact-detail (max-width: 650px)': { '.detail-heading': { flexWrap: 'wrap', padding: 16, gap: 12 }, '.contact-actions': { marginLeft: 'auto' }, '.info': { gridTemplateColumns: 'minmax(0, 1fr)' }, '.tabs': { padding: '0 8px' }, '.tab': { padding: '12px 10px' } },
  '@container address-book (max-width: 820px)': { '.workspace': { flex: '0 0 auto', gridTemplateColumns: 'minmax(0, 1fr)', gridTemplateRows: 'auto auto' }, '.contacts': { height: 'clamp(260px, 45vh, 420px)', boxSizing: 'border-box' }, '.detail-body': { overflowY: 'visible' }, '.contacts-guide': { display: 'none' } },
  '@media (max-height: 760px)': { '.contacts-guide': { display: 'none' } },
  '@container contact-detail (max-width: 420px)': { '.detail-heading h2': { fontSize: 18 }, '.detail-heading .avatar': { width: 44, height: 44, fontSize: 20 }, '.address-actions': { flexBasis: '100%', justifyContent: 'flex-end' }, '.info > div': { gridTemplateColumns: 'minmax(0, 1fr)', gap: 4 } },

}));

const DeleteContactButton = styled.button(({ theme }) => ({
  ...moduleAction,
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
  fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer',
  color: theme.foreground, background: fade(theme.danger, 0.94),
  border: `1px solid ${fade(theme.danger, 0.45)}`,
  '> svg': { width: 18, height: 18, flexShrink: 0, fill: 'currentColor', stroke: 'none', color: mix(theme.danger, theme.foreground, 0.55) },
  '&:hover': { background: fade(theme.danger, 0.85), borderColor: mix(theme.danger, theme.foreground, 0.35) },
  '&:focus-visible': { outline: `2px solid ${theme.primary}`, outlineOffset: 3 },
}));

function Activity({ contact }) {
  const [state, setState] = useState({ loading: true, items: [] });
  const addresses = contact.addresses.map(({ address }) => address).filter((address) => /^[a-zA-Z0-9]{51,64}$/.test(address));
  const query = addresses.flatMap((address) => ['from.address', 'to.address', 'address', 'recipient.address'].map((field) => `results.contracts.${field}=${address}`)).join(' OR ');
  useEffect(() => {
    let active = true;
    if (!query) { setState({ items: [] }); return; }
    setState({ loading: true, items: [] });
    callAPI('profiles/transactions/master', { verbose: 'summary', limit: 20, page: 0, where: `(${query})` })
      .then((items) => { if (active) setState({ items }); })
      .catch(() => { if (active) setState({ items: [], error: true }); });
    return () => { active = false; };
  }, [query]);
  return <section className="section"><h3><Icon icon={historyIcon} />{__('Recent transactions')}</h3>
    {state.loading ? <p role="status">{__('Loading transactions...')}</p> : state.error ? <p role="alert">{__('Unable to load activity. Reopen this tab to try again.')}</p> : !state.items.length ? <p className="empty">{__('No transactions found')}</p> : state.items.map((tx) => <Button key={tx.txid} skin="plain" className="activity-row" onClick={() => openModal(TransactionDetailsModal, { txid: tx.txid })}>{formatDateTime(tx.timestamp * 1000, { year: 'numeric', month: 'short', day: '2-digit' })} · {tx.contracts?.map((c) => c.OP).join(', ') || tx.type}</Button>)}
  </section>;
}

const shortAddress = (address) => address.length > 14 ? `${address.slice(0, 6)}...${address.slice(-5)}` : address;

function Details({ contact, coreConnected }) {
  const [tab, setTab] = useState('overview');
  const tabs = [['overview', __('Details'), bookIcon], ['addresses', __('Wallet addresses'), walletIcon], ['activity', __('Activity'), historyIcon]];
  const tz = timeZones.find((zone) => zone.value === contact.timeZone);
  const local = tz ? new Date(Date.now() + tz.value * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }) + ` (${tz.offset})` : null;
  const edit = () => openModal(AddEditContactModal, { edit: true, contact });
  const fields = [
    [__('Nexus user ID'), contact.genesis, profileCardIcon],
    [__('Phone'), contact.phoneNumber, phoneIcon],
    [__('Email'), contact.email ? <ExternalLink href={`mailto:${contact.email}`}>{contact.email}</ExternalLink> : null, emailIcon],
    [__('Local time'), local, historyIcon],
  ];
  const sectionHeading = (icon, title, action) => <div className="section-heading"><h3><Icon icon={icon} />{title}</h3>{coreConnected && <Button type="button" skin="hyperlink" onClick={edit}><Icon icon={plusIcon} />{action}</Button>}</div>;
  return <section className="surface detail">
    <div className="detail-heading"><span className="avatar">{contact.name.charAt(0).toUpperCase()}</span><div className="contact-identity"><h2>{contact.name}</h2><p>{__('Nexus contact')}</p></div>
      <div className="contact-actions">
        {coreConnected && <Button type="button" skin="default" onClick={edit}><Icon icon={editIcon} />{__('Edit')}</Button>}
        <Dropdown dropdown={({ closeDropdown }) => <DeleteContactButton type="button" onClick={async () => { closeDropdown(); if (await confirm({ question: __('Delete contact %{name}?', { name: contact.name }), skinYes: 'danger' })) deleteContact(contact.name); }}><Icon icon={trashIcon} aria-hidden="true" />{__('Delete contact')}</DeleteContactButton>}>
          {({ open, openDropdown }) => <Button type="button" skin="default" square={38} aria-label={__('More contact actions')} aria-haspopup="true" aria-expanded={open} onClick={openDropdown}><span aria-hidden="true">&#8942;</span></Button>}
        </Dropdown>
      </div>
    </div>
    <div className="tabs" role="tablist" aria-label={__('Contact details')}>
      {tabs.map(([id, label, icon], index) => <button key={id} id={`contact-tab-${id}`} role="tab" aria-selected={tab === id} aria-controls="contact-panel" tabIndex={tab === id ? 0 : -1} className="tab" onClick={() => setTab(id)} onKeyDown={(event) => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
        setTab(tabs[next][0]); document.getElementById(`contact-tab-${tabs[next][0]}`)?.focus();
      }}><Icon icon={icon} />{label}</button>)}
    </div>
    <div className="detail-body" role="tabpanel" id="contact-panel" aria-labelledby={`contact-tab-${tab}`}>
      {tab === 'overview' && <section className="section">{sectionHeading(userIcon, __('Contact details'), __('Add details'))}<dl className="info">{fields.map(([label, value, icon]) => <div key={label}><dt><Icon icon={icon} />{label}</dt><dd>{value || <span className="muted">{__('Not added')}</span>}</dd></div>)}</dl></section>}
      {tab === 'addresses' && <section className="section">{sectionHeading(walletIcon, __('Wallet addresses'), __('Add address'))}
        {!contact.addresses.length && <p className="muted">{__('No saved addresses')}</p>}
        {contact.addresses.map((entry, index) => <div className="address-row" key={`${entry.address}:${index}`}>
          <span className="currency"><Icon icon={logoIcon} />NXS</span>
          <Tooltip.Trigger tooltip={entry.address} position="top" align="start" maxWidth="min(360px, calc(100vw - 40px))" style={{ fontFamily: 'Consolas, monospace', overflowWrap: 'anywhere' }}><code>{shortAddress(entry.address)}</code></Tooltip.Trigger>
          {(entry.label || entry.isMine) && <span className="badge address-label">{entry.label || __('My address')}</span>}
          <div className="address-actions">
            <Tooltip.Trigger tooltip={__('Copy address')}><Button type="button" skin="default" square={34} aria-label={__('Copy address')} onClick={() => { clipboard.writeText(entry.address); showNotification(__('Address has been copied to clipboard'), 'success'); }}><Icon icon={copyIcon} /></Button></Tooltip.Trigger>
            <QRButton address={entry.address} />
            <Button type="button" skin="filled-primary" disabled={!coreConnected} onClick={() => goToSend({ recipients: [{ nameOrAddress: entry.address }] })}><Icon icon={sendIcon} />{__('Send')}</Button>
          </div>
        </div>)}
      </section>}
      {tab === 'overview' && <section className="section notes-section">{sectionHeading(notesIcon, __('Notes'), contact.notes ? __('Edit note') : __('Add note'))}<p className={contact.notes ? 'notes' : 'notes muted'}>{contact.notes || __('No notes added')}</p></section>}
      {tab === 'activity' && <Activity contact={contact} />}
    </div>
  </section>;
}

export default function ModernAddressBook() {
  const addressBook = useSelector((state) => state.addressBook) || {};
  const { selectedContactName, searchQuery = '' } = useSelector((state) => state.ui.addressBook);
  const coreConnected = useSelector(isCoreConnected);
  const [filter, setFilter] = useState('all');
  const [importing, setImporting] = useState(false);
  const fileRef = useRef();
  const contacts = Object.values(addressBook);
  const query = searchQuery.trim().toLowerCase();
  const visible = contacts.filter((c) => (filter === 'all' || (filter === 'address' ? c.addresses.length : filter === 'email' ? c.email?.trim() : c.phoneNumber?.trim())) && [c.name, c.email, c.phoneNumber, ...c.addresses.map((a) => `${a.address} ${a.label || ''}`)].some((value) => value?.toLowerCase().includes(query)));
  const selected = visible.find((c) => c.name === selectedContactName) || visible[0];
  const importFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const { contacts: added, skipped } = parseContactImport(text, store.getState().addressBook);
      added.forEach(addNewContact);
      showNotification(__('Imported %{count} contacts; skipped %{skipped} existing names.', { count: added.length, skipped }), 'success');
    } catch (error) { openErrorDialog({ message: __('Unable to import contacts'), note: error.message }); }
    finally { setImporting(false); }
  };
  return <Dashboard>
    <header className="page-heading"><div className="page-title"><div><h1>{__('Address Book')}</h1><p className="subtitle">{__('Manage trusted contacts and wallet destinations')}</p></div></div><div className="actions">
      <Button skin="filled-primary" disabled={!coreConnected} onClick={() => openModal(AddEditContactModal)}><Icon icon={plusIcon} />{__('New Contact')}</Button>
      <Button skin="primary" disabled={importing} onClick={() => fileRef.current?.click()}><Icon icon={downloadIcon} />{importing ? __('Importing...') : __('Import')}</Button>
      <Button skin="primary" disabled={!contacts.length} onClick={() => exportContacts(addressBook)}><Icon icon={exportIcon} />{__('Export')}</Button>
      <input ref={fileRef} type="file" accept=".json,application/json" hidden onChange={importFile} aria-label={__('Import address book JSON')} />
    </div></header>
    <div className="workspace"><aside className="surface contacts"><div className="contacts-heading"><h2>{__('Contacts')}</h2><span>{contacts.length === 1 ? __('1 contact') : __('%{count} contacts', { count: contacts.length })}</span></div><div className="list-controls"><label className="search"><Icon icon={searchIcon} /><input aria-label={__('Search contacts')} placeholder={__('Search contacts...')} value={searchQuery} onChange={(event) => searchContact(event.target.value)} /></label><select aria-label={__('Filter contacts')} value={filter} onChange={(event) => setFilter(event.target.value)}><option value="all">{__('All Contacts')}</option><option value="address">{__('With address')}</option><option value="email">{__('With email')}</option><option value="phone">{__('With phone')}</option></select></div>
      <div className="contact-list">{visible.map((c) => <button className="contact" key={c.name} aria-pressed={selected?.name === c.name} onClick={() => selectContact(c.name)}><span className="avatar">{c.name.charAt(0).toUpperCase()}</span><span className="contact-name">{c.name}</span>{!!c.addresses.length && <span className="badge">{c.addresses.length === 1 ? __('1 address') : __('%{count} addresses', { count: c.addresses.length })}</span>}<span aria-hidden="true">›</span></button>)}{!visible.length && <p className="empty">{contacts.length ? __('No matching contacts') : __('Your address book is empty')}</p>}</div>
      {contacts.length <= 2 && !query && <div className="contacts-guide"><Icon icon={bookIcon} size={44} aria-hidden="true" /><p>{__('Keep your trusted contacts in one place')}</p><ul><li><Icon icon={checkIcon} />{__('Save wallet addresses for quick sending')}</li><li><Icon icon={checkIcon} />{__('Add notes to keep track of contacts')}</li><li><Icon icon={checkIcon} />{__('Import or export your address book')}</li></ul></div>}
    </aside>{selected ? <Details key={selected.name} contact={selected} coreConnected={coreConnected} /> : <section className="surface detail"><p className="empty">{__('Select a contact to view details')}</p></section>}</div>
  </Dashboard>;
}
