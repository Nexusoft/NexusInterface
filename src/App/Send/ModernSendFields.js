import { moduleLayout, modulePanel, moduleAction } from 'utils/moduleStyles';
import { useId, useLayoutEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useForm, useFormState } from 'react-final-form';
import styled from '@emotion/styled';
import Form from 'components/Form';
import Button from 'components/Button';
import Icon from 'components/Icon';
import Tooltip from 'components/Tooltip';
import ControlledModal from 'components/ControlledModal';
import TokenName from 'components/TokenName';
import { openModal } from 'lib/ui';
import { required } from 'lib/form';
import { getDefaultExpiry, getDefaultRecipient, getSource } from 'lib/send';
import { formatNumber } from 'lib/intl';
import { fade, mix, luminosity } from 'utils/color';
import sendIcon from 'icons/send.svg';
import plusIcon from 'icons/plus.svg';
import bookIcon from 'icons/address-book.svg';
import walletIcon from 'icons/wallet.svg';
import questionIcon from 'icons/question-mark-circle.svg';
import settingsIcon from 'icons/settings.svg';
import RecipientNameOrAddress from './RecipientNameOrAddress';
import AmountField from './AmountField';
import ReferenceField from './ReferenceField';
import ExpiryFields from './ExpiryFields';
import useTransferFee from './useTransferFee';

__ = __context('Send');

const Workflow = styled.div(({ theme }) => ({
  display: 'flex', flexDirection: 'column', flex: '1 0 auto', minWidth: 0,
  '.send-heading': { ...modulePanel(theme), display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 14, padding: moduleLayout.compactPadding, marginBottom: 14 },
  '.send-heading > div': { flex: '1 1 200px', minWidth: 0 },
  h1: { margin: 0, fontSize: moduleLayout.titleSize, fontWeight: 600, lineHeight: 1.3 },
  '.send-heading p': { margin: '4px 0 0', color: theme.mixer(0.7), fontSize: 12, lineHeight: 1.5 },
  '.columns': { display: 'grid', flex: '1 0 auto', gridTemplateColumns: 'minmax(0, 1.85fr) minmax(280px, 1fr)', gap: moduleLayout.gap, alignItems: 'stretch' },
  '.card': { ...modulePanel(theme), minWidth: 0, padding: moduleLayout.panelPadding, borderColor: fade(theme.primary, 0.65) },
  '.fields': { display: 'flex', flexDirection: 'column', containerType: 'inline-size', containerName: 'send-fields' },
  '.step': { flex: '1 0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 0 16px', marginBottom: 16, borderBottom: `1px solid ${fade(theme.primary, 0.65)}` },
  '.step h2': { marginBottom: 14 },
  '.step .add-recipient': { alignSelf: 'flex-start' },
  '.amount-step': { borderBottom: 0, marginBottom: 0, paddingBottom: 0 },
  h2: { display: 'flex', alignItems: 'center', gap: 14, fontSize: moduleLayout.sectionTitleSize, fontWeight: 600, margin: '0 0 18px' },
  '.number': { display: 'inline-grid', placeItems: 'center', width: 32, height: 28, flexShrink: 0, borderRadius: 20, color: theme.primary, background: fade(theme.primary, 0.87), fontSize: 15 },
  '.source': { display: 'grid', gridTemplateColumns: '78px minmax(0, 1fr) auto', gap: 18, alignItems: 'center' },
  '.source > label': { margin: 0 },
  '.source > div': { minWidth: 0 },
  '.source-balance': { borderLeft: `1px solid ${fade(theme.primary, 0.7)}`, paddingLeft: 20, fontSize: 11, color: theme.mixer(0.75) },
  '.source-balance strong': { display: 'block', marginTop: 6, fontSize: 13, color: theme.foreground },
  '.source-balance .balance-unit': { fontSize: 10, fontWeight: 400 },
  '.recipient-row': { display: 'flex', alignItems: 'flex-start', gap: 18 },
  '.recipient-input': { flex: 1, minWidth: 0 },
  '.recipient-input input:focus-visible': { outline: 'none' },
  '.recipient-input > div': { display: 'grid', gridTemplateColumns: '78px minmax(0, 1fr)', columnGap: 18, alignItems: 'center', marginTop: 0 },
  '.recipient-input label': { marginBottom: 0 },
  '.recipient-input > div > div': { minWidth: 0 },
  '.recipient-input .mt1': { gridColumn: 2, marginTop: 4 },
  '.address-book, .remove': { ...moduleAction, flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: moduleLayout.controlHeight },
  '.add-recipient': { display: 'inline-flex', alignItems: 'center', gap: 8, margin: '8px 0 0 96px', padding: 0, fontSize: 13 },
  '.recipient-header': { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  '.fee-label': { display: 'inline-flex', alignItems: 'center', gap: 6 },
  '.fee-info': { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 3, border: 0, background: 'transparent', color: theme.mixer(0.75), cursor: 'help', fontSize: 14 },
  '.fee-info:hover, .fee-info:focus-visible': { color: theme.primary },
  '.advanced-toggle': { display: 'flex', alignItems: 'center', gap: 12, width: '100%', marginTop: 16, padding: '10px 14px', borderRadius: 10, border: `1px solid ${fade(theme.primary, 0.6)}`, background: fade(theme.primary, 0.97), color: theme.foreground, fontSize: 14, cursor: 'pointer' },
  '.advanced-toggle .chevron': { display: 'block', width: 18, height: 18, flexShrink: 0, marginLeft: 'auto', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', transform: 'rotate(0deg)', transformOrigin: 'center', transition: 'transform 150ms' },
  '.advanced-toggle[aria-expanded="true"] .chevron': { transform: 'rotate(180deg)' },
  '.advanced-content': { paddingTop: 8 },
  '.summary': { display: 'flex', flexDirection: 'column', alignSelf: 'start', boxSizing: 'border-box', minHeight: 'var(--preview-height, 0px)', background: `linear-gradient(145deg, ${mix(theme.background, theme.primary, 0.07)}, ${mix(theme.background, theme.primary, 0.025)})` },
  '.summary h2': { paddingBottom: 20, borderBottom: `1px solid ${fade(theme.primary, 0.6)}`, fontSize: moduleLayout.sectionTitleSize, marginBottom: 0 },
  '.summary h2 svg': { color: theme.primary, flexShrink: 0 },
  dl: { margin: 0 },
  '.summary dl > div': { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, padding: 'clamp(12px, 2vh, 18px) 6px', borderBottom: `1px solid ${fade(theme.primary, 0.75)}`, fontSize: 13 },
  '.summary dl > div:last-child': { borderBottom: 0 },
  dt: { color: theme.mixer(0.8) },
  dd: { margin: 0, minWidth: 0, maxWidth: '60%', textAlign: 'right', overflowWrap: 'anywhere', fontVariantNumeric: 'tabular-nums' },
  '.recipient-preview': { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  '.summary .total': { fontSize: 16, fontWeight: 600 },
  '.summary .total dt': { color: theme.foreground },
  '.review': { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, width: '100%', minHeight: moduleLayout.controlHeight, marginTop: 'auto', borderRadius: 8, fontSize: 13, background: theme.primary, color: luminosity(theme.primary) > 0.179 ? '#000' : '#fff' },
  '.reset-form': { ...moduleAction, display: 'inline-flex', alignItems: 'center', gap: 8, marginLeft: 'auto', flexShrink: 0 },
  '&&&& .reset-form:focus-visible': { outline: 'none', background: fade(theme.primary, 0.9) },
  '@container send-layout (max-width: 960px)': {
    '.columns': { gridTemplateColumns: 'minmax(0, 1fr)', flex: '0 0 auto' },
    '.step': { flexGrow: 0 },
    '.summary': { minHeight: 0 },
    '.summary .review': { marginTop: 20 },
  },
  '@container send-fields (max-width: 560px)': {
    '.source': { gridTemplateColumns: '78px minmax(0, 1fr)', gap: 12 },
    '.source-balance': { gridColumn: 2, borderLeft: 0, paddingLeft: 0, display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' },
    '.source-balance strong': { marginTop: 0 },
    '.recipient-row': { flexWrap: 'wrap', gap: 10 },
    '.recipient-input': { flexBasis: '100%' },
    '.recipient-input > div': { columnGap: 12 },
    '.address-book, .add-recipient': { marginLeft: 90 },
  },
  '@container send-fields (max-width: 380px)': {
    '.source, .recipient-input > div': { gridTemplateColumns: 'minmax(0, 1fr)', gap: 8 },
    '.source-balance, .recipient-input .mt1': { gridColumn: 1 },
    '.address-book, .add-recipient': { marginLeft: 0 },
    h2: { fontSize: 16, gap: 10 },
  },
  '@container send-layout (max-width: 440px)': {
    '.send-heading': { padding: 14, gap: 10 },
    '.send-heading > div': { flexBasis: '100%' },
    '.send-heading .reset-form': { marginLeft: 0 },
    '.summary dl > div': { paddingLeft: 0, paddingRight: 0 },
  },
  '@media (max-height: 760px)': {
    '.send-heading': { paddingTop: 12, paddingBottom: 12 },
    '.advanced-toggle': { marginTop: 16 },
    '.summary h2': { paddingBottom: 14 },
  },
}));

function ContactPicker({ choices, onSelect }) {
  const [query, setQuery] = useState('');
  const matches = choices.filter((choice) => `${choice.label} ${choice.address}`.toLowerCase().includes(query.toLowerCase()));
  return <ControlledModal maxWidth={560}>{(close) => <>
    <ControlledModal.Header>{__('Choose a saved address')}</ControlledModal.Header>
    <ControlledModal.Body>
      <input aria-label={__('Search contacts')} placeholder={__('Search contacts...')} value={query} onChange={(event) => setQuery(event.target.value)} style={{ width: '100%', padding: 12, marginBottom: 12, background: 'transparent', color: 'inherit', border: '1px solid currentColor' }} />
      {matches.map((choice, index) => <Button key={index} skin="plain" style={{ display: 'block', width: '100%', textAlign: 'left', height: 'auto', padding: 12, whiteSpace: 'normal', overflowWrap: 'anywhere' }} onClick={() => { onSelect(choice.address); close(); }}><strong>{choice.label}</strong><br /><small>{choice.address}</small></Button>)}
      {!matches.length && <p>{__('No saved addresses found')}</p>}
    </ControlledModal.Body>
    <ControlledModal.Footer><Button onClick={close}>{__('Cancel')}</Button></ControlledModal.Footer>
  </>}</ControlledModal>;
}

export function summarizeAmounts(recipients, balance) {
  const amounts = (recipients || []).map((recipient) => Number(String(recipient.amount ?? '').replace(',', '.')));
  const total = amounts.reduce((sum, amount) => sum + (Number.isFinite(amount) && amount > 0 ? amount : 0), 0);
  return { total, remaining: Number.isFinite(balance) ? balance - total : null };
}

export default function ModernSendFields({ accountOptions }) {
  const form = useForm();
  const { values } = useFormState({ subscription: { values: true } });
  const source = useSelector((state) => getSource(state, values.sendFrom));
  const addressBook = useSelector((state) => state.addressBook);
  const id = useId();
  const workflowRef = useRef(null);
  useLayoutEffect(() => {
    const workflow = workflowRef.current;
    const viewport = workflow.closest('[data-send-viewport]');
    if (!viewport) return;
    const heading = workflow.querySelector('.send-heading');
    const columns = workflow.querySelector('.columns');
    const updatePreviewHeight = () => {
      // Measure the viewport, not the expanding form or its grid row.
      const top = columns.getBoundingClientRect().top - viewport.getBoundingClientRect().top + viewport.scrollTop;
      const bottomPadding = parseFloat(getComputedStyle(viewport).paddingBottom) || 0;
      workflow.style.setProperty('--preview-height', `${Math.max(0, viewport.clientHeight - top - bottomPadding)}px`);
    };
    const observer = new ResizeObserver(updatePreviewHeight);
    observer.observe(viewport);
    observer.observe(heading);
    updatePreviewHeight();
    return () => observer.disconnect();
  }, []);
  const account = source?.account || source?.token;
  const balance = account?.balance == null ? null : Number(account.balance);
  const currency = source ? (source.account?.token === '0' ? 'NXS' : TokenName.from(source)) : '';
  const { total, remaining } = summarizeAmounts(values.recipients, balance);
  const accounts = useSelector((state) => state.user.accounts);
  const feeAccount = accounts?.find((item) => item.name === 'default' && item.token === '0');
  const paymentCount = (values.recipients || []).filter((recipient) => Number(String(recipient.amount || '').replace(',', '.')) > 0).length;
  const fee = useTransferFee(paymentCount);
  const native = source?.account?.token === '0';
  const feeFromSource = native && feeAccount?.address === account?.address;
  const remainingAfterFee = remaining == null || fee == null ? null : remaining - (feeFromSource ? fee : 0);
  const feeInsufficient = fee > 0 && (!feeAccount || Number(feeAccount.balance) < fee + (feeFromSource ? total : 0));
  const feeExplanation = __('Most everyday Nexus transfers are free when at least 10 seconds have passed since your previous transaction. Faster transactions can incur a fee of 0.01 NXS per payment contract. Creating tokens, names, namespaces or data registers, and executing complex conditions, can also incur fees.');
  const money = (amount) => amount == null ? '\u2014' : `${formatNumber(amount, account?.decimals ?? 6)} ${currency}`;
  const choices = Object.values(addressBook || {}).flatMap((contact) => (contact.addresses || []).filter((entry) => !entry.isMine).map((entry) => ({ address: entry.address, label: `${contact.name}${entry.label ? ` - ${entry.label}` : ''}` })));
  const feeText = !source ? '\u2014' : fee == null ? __('Unavailable') : `${formatNumber(fee, 6)} NXS`;
  const recipientNames = (values.recipients || []).map((recipient) => recipient.nameOrAddress || recipient.address).filter(Boolean);
  const recipientText = recipientNames.join(', ');
  const recipientPreview = recipientNames.map((name) => name.length > 14 ? `${name.slice(0, 6)}...${name.slice(-5)}` : name).join(', ');
  const feeInfo = <Tooltip.Trigger tooltip={feeExplanation} position="top"><button type="button" className="fee-info" aria-label={feeExplanation}><Icon icon={questionIcon} /></button></Tooltip.Trigger>;
  return <Workflow ref={workflowRef}>
    <header className="send-heading"><div><h1>{__('Send NXS')}</h1><p>{__('Transfer NXS securely between accounts and addresses')}</p></div><Button type="button" className="reset-form" skin="primary" onClick={() => form.restart({ sendFrom: null, recipients: [getDefaultRecipient()], expiry: getDefaultExpiry(), advancedOptions: false })}><span aria-hidden="true">&#8630;</span>{__('Clear All')}</Button></header>
    <div className="columns">
      <div className="card fields">
        <section className="step" id={`${id}-0`}>
          <h2><span className="number">01</span>{__('Source account')}</h2>
          <div className="source"><label id={`${id}-source-label`}>{__('Send from')}</label><Form.Select aria-labelledby={`${id}-source-label`} name="sendFrom" skin="filled-inverted" options={accountOptions} placeholder={__('Select an account')} validate={required()} /><div className="source-balance">{__('Available balance')}<strong>{balance == null ? '\u2014' : <>{formatNumber(balance, account?.decimals ?? 6)} <span className="balance-unit">{currency}</span></>}</strong></div></div>
        </section>
        <Form.FieldArray name="recipients" render={({ fields }) => <>
          <section className="step" id={`${id}-1`}>
            <h2><span className="number">02</span>{__('Recipient')}</h2>
            {fields.map((fieldName, index) => <div key={fieldName}>
              {fields.length > 1 && <div className="recipient-header"><p>{__('Recipient')} {index + 1}</p><Button type="button" skin="plain-danger" className="remove" onClick={() => fields.remove(index)}>{__('Remove')}</Button></div>}
              <div className="recipient-row"><div className="recipient-input"><RecipientNameOrAddress parentFieldName={fieldName} /></div><Button type="button" className="address-book" skin="primary" onClick={() => openModal(ContactPicker, { choices, onSelect: (address) => form.change(`${fieldName}.nameOrAddress`, address) })}><Icon icon={bookIcon} />{__('Address Book')}</Button></div>
            </div>)}
            <Button type="button" skin="hyperlink" className="add-recipient" onClick={() => fields.push(getDefaultRecipient())}><Icon icon={plusIcon} />{__('Add another recipient')}</Button>
          </section>
          <section className="step amount-step" id={`${id}-2`}>
            <h2><span className="number">03</span>{__('Amount')}</h2>
            {fields.map((fieldName, index) => <div key={fieldName}>
              {fields.length > 1 && <p>{__('Recipient')} {index + 1}</p>}
              <AmountField parentFieldName={fieldName} dashboard />
            </div>)}
            <button type="button" className="advanced-toggle" aria-expanded={!!values.advancedOptions} aria-controls={`${id}-advanced`} onClick={() => form.change('advancedOptions', !values.advancedOptions)}><Icon icon={settingsIcon} />{__('Advanced options')}<svg className="chevron" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6" /></svg></button>
            <div id={`${id}-advanced`} className="advanced-content" hidden={!values.advancedOptions}>
              {fields.map((fieldName, index) => <div key={fieldName}>{values.advancedOptions && fields.length > 1 && <p>{__('Recipient')} {index + 1}</p>}<ReferenceField parentFieldName={fieldName} /></div>)}
              <ExpiryFields />
            </div>
          </section>
        </>} />
      </div>
      <aside className="card summary">
        <h2><Icon icon={walletIcon} size={moduleLayout.sectionIconSize} />{__('Transaction preview')}</h2>
        <dl>
          <div><dt>{__('Sending')}</dt><dd>{source && total > 0 ? money(total) : '\u2014'}</dd></div>
          <div><dt>{__('Recipient')}</dt><Tooltip.Trigger tooltip={recipientText} position="top" align="end" maxWidth="min(360px, calc(100vw - 40px))" style={{ fontFamily: 'Consolas, monospace', textAlign: 'left', overflowWrap: 'anywhere', padding: '12px 16px' }}><dd className="recipient-preview">{recipientPreview || '\u2014'}</dd></Tooltip.Trigger></div>
          <div><dt className="fee-label">{__('Network fee')}{feeInfo}</dt><dd>{feeText}</dd></div>
          <div className="total"><dt>{__('Total to debit')}</dt><dd>{!source || fee == null || !total ? '\u2014' : native ? money(total + fee) : <>{money(total)} + {formatNumber(fee, 6)} NXS</>}</dd></div>
          <div><dt>{__('Remaining balance')}</dt><dd>{money(remainingAfterFee)}</dd></div>
        </dl>
        {feeInsufficient && <p role="alert" className="error">{__('Your default NXS account has insufficient funds for the estimated fee.')}</p>}
        {remaining != null && remaining < 0 && <p role="alert" className="error">{__('The transfer amount exceeds your available balance.')}</p>}
        <Form.SubmitButton className="review" skin="filled-primary"><Icon icon={sendIcon} />{__('Review transaction')}</Form.SubmitButton>
      </aside>
    </div>
  </Workflow>;
}
