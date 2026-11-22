import styled from '@emotion/styled';
import ControlledModal from 'components/ControlledModal';
import Button from 'components/Button';
import QRButton from 'components/QRButton';
import Spinner from 'components/Spinner';
import NewAccountModal from 'components/NewAccountModal';
import { openModal } from 'lib/ui';
import { formatDateTime, formatNumber } from 'lib/intl';
import { fade } from 'utils/color';
import RegistryModalHeader from '../RegistryModalHeader';

__ = __context('User.Tokens.TokenDetails');

const Heading = styled.div(({ theme }) => ({
  '.eyebrow': { fontSize: 12, color: theme.mixer(0.65), marginBottom: 3 },
  h2: { margin: 0, color: theme.foreground, fontSize: 26, fontWeight: 600, lineHeight: 1.3, overflowWrap: 'anywhere' },
}));

const Content = styled.div(({ theme }) => ({
  '.metrics': { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 },
  '.metric': { padding: 18, minWidth: 0, borderRadius: 12, border: `1px solid ${fade(theme.foreground, 0.9)}`, background: fade(theme.foreground, 0.97) },
  '.metric.balance': { gridColumn: '1 / -1', background: fade(theme.primary, 0.94), borderColor: fade(theme.primary, 0.75) },
  '.label, dt': { fontSize: 12, color: theme.mixer(0.65) },
  '.value': { marginTop: 8, fontSize: 24, fontWeight: 600, lineHeight: 1.3, color: theme.foreground, fontVariantNumeric: 'tabular-nums', overflowWrap: 'anywhere' },
  '.balance .value': { fontSize: 32 },
  '.unit': { marginLeft: 8, fontSize: 13, fontWeight: 400, color: theme.mixer(0.7) },
  dl: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 18, margin: '24px 0' },
  dd: { margin: '5px 0 0', fontSize: 13, color: theme.foreground, overflowWrap: 'anywhere' },
  '.address': { marginTop: 12, padding: '14px 16px', borderRadius: 12, border: `1px solid ${fade(theme.foreground, 0.9)}`, background: fade(theme.foreground, 0.98) },
  '.address-row': { display: 'flex', alignItems: 'center', gap: 12, marginTop: 6 },
  code: { flex: 1, minWidth: 0, fontSize: 12, lineHeight: 1.8, overflowWrap: 'anywhere', whiteSpace: 'normal', color: theme.foreground, userSelect: 'text' },
  '.address-row button': { flexShrink: 0 },
  '@media (max-height: 800px), (max-width: 640px)': {
    '.metrics': { gap: 8 },
    '.metric': { padding: '12px 14px' },
    '.value': { fontSize: 20, marginTop: 4 },
    '.balance .value': { fontSize: 26 },
    dl: { gap: 12, margin: '16px 0' },
    '.address': { padding: '10px 12px', marginTop: 8 },
  },
  '@media (max-width: 480px)': { '.metrics, dl': { gridTemplateColumns: 'minmax(0, 1fr)' }, '.balance .value': { fontSize: 26 } },
}));

const Actions = styled.div({
  display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: 12,
  button: { height: 'auto', minHeight: 44, padding: '10px 18px', whiteSpace: 'normal' },
});

const dateOptions = { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' };

export default function ModernTokenDetails({ token }) {
  return <ControlledModal maxWidth={760}>
    {closeModal => <>
      <RegistryModalHeader section="Tokens">
        <Heading><div className="eyebrow">{__('Token Details')}</div><h2>{token?.ticker || __('Token')}</h2></Heading>
      </RegistryModalHeader>
      <ControlledModal.Body>
        {!token ? <div className="text-center"><Spinner size={24} /></div> : <Content>
          <div className="metrics">
            <div className="metric balance"><div className="label">{__('Balance')}</div><div className="value">{formatNumber(token.balance, token.decimals)}<span className="unit">{token.ticker}</span></div></div>
            {[[__('Current Supply'), token.currentsupply], [__('Max Supply'), token.maxsupply]].map(([label, value]) => <div className="metric" key={label}><div className="label">{label}</div><div className="value">{formatNumber(value, 0)}</div></div>)}
          </div>
          <dl>
            <div><dt>{__('Created at')}</dt><dd>{formatDateTime(token.created * 1000, dateOptions)}</dd></div>
            <div><dt>{__('Last modified')}</dt><dd>{formatDateTime(token.modified * 1000, dateOptions)}</dd></div>
            <div><dt>{__('Decimals')}</dt><dd>{token.decimals}</dd></div>
            {[[__('Unclaimed balance'), token.unclaimed], [__('Unconfirmed balance'), token.unconfirmed]].filter(([, value]) => typeof value === 'number').map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{formatNumber(value, token.decimals)} {token.ticker}</dd></div>)}
          </dl>
          <section className="address"><div className="label">{__('Token address')}</div><div className="address-row"><code>{token.address || '0'}</code><QRButton address={token.address} /></div></section>
          <section className="address"><div className="label">{__('Token Owner')}</div><div className="address-row"><code>{token.owner || '0'}</code></div></section>
        </Content>}
      </ControlledModal.Body>
      <ControlledModal.Footer separator><Actions>
        <Button onClick={closeModal}>{__('Close')}</Button>
        {token && <Button skin="filled-primary" onClick={() => openModal(NewAccountModal, { tokenAddress: token.address, tokenName: token.ticker })}>{__('Create new account with this token')}</Button>}
      </Actions></ControlledModal.Footer>
    </>}
  </ControlledModal>;
}
