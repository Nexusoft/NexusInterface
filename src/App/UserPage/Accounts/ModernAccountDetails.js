import styled from '@emotion/styled';

import ControlledModal from 'components/ControlledModal';
import Button from 'components/Button';
import AdjustStakeModal from 'components/AdjustStakeModal';
import QRButton from 'components/QRButton';
import TokenName from 'components/TokenName';
import { goToSend } from 'lib/send';
import { formatDateTime, formatNumber } from 'lib/intl';
import { openModal } from 'lib/ui';
import { fade } from 'utils/color';
import { totalBalance } from './utils';

__ = __context('User.Accounts.AccountDetails');

const Heading = styled.div(({ theme }) => ({
  '.eyebrow': { fontSize: 12, fontWeight: 500, color: theme.mixer(0.65), letterSpacing: 0, marginBottom: 4 },
  'h2': { margin: 0, fontSize: 26, lineHeight: 1.3, letterSpacing: '-0.6px', fontWeight: 600, color: theme.foreground, overflowWrap: 'anywhere' },
}));

const BalanceGrid = styled.div({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
  gap: 12,
});

const BalanceCard = styled.div(({ theme }) => ({
  minWidth: 0,
  padding: 20,
  borderRadius: 14,
  border: `1px solid ${fade(theme.foreground, 0.9)}`,
  background: fade(theme.foreground, 0.97),
  '&:first-of-type': { background: fade(theme.primary, 0.95), borderColor: fade(theme.primary, 0.8) },
  '.label': { color: theme.mixer(0.7), fontSize: 12, fontWeight: 500 },
  '.balance': { display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  '.value': { fontSize: 32, fontWeight: 600, letterSpacing: '-1px', lineHeight: 1.2, fontVariantNumeric: 'tabular-nums', overflowWrap: 'anywhere', minWidth: 0 },
  '.token': { fontSize: 12, fontWeight: 500, color: theme.mixer(0.65) },
}));

const Details = styled.dl(({ theme }) => ({
  display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 20,
  margin: '22px 0', padding: '0 2px',
  'dt': { fontSize: 12, color: theme.mixer(0.6), marginBottom: 6 },
  'dd': { margin: 0, fontSize: 13, fontWeight: 400, lineHeight: 1.6, color: theme.mixer(0.9), overflowWrap: 'anywhere' },
  '.data': { gridColumn: '1 / -1', whiteSpace: 'pre-wrap' },
  '@media (max-width: 480px)': { gridTemplateColumns: 'minmax(0, 1fr)' },
}));

const Address = styled.section(({ theme }) => ({
  padding: '14px 16px', borderRadius: 12,
  border: `1px solid ${fade(theme.foreground, 0.9)}`, background: fade(theme.foreground, 0.98),
  'h3': { margin: '0 0 6px', fontSize: 12, fontWeight: 500, color: theme.mixer(0.65) },
  '.address-row': { display: 'flex', alignItems: 'center', gap: 12 },
  'code': { flex: 1, minWidth: 0, padding: 0, fontSize: 12, fontWeight: 400, lineHeight: 1.8, color: theme.mixer(0.9), overflowWrap: 'anywhere', userSelect: 'text' },
  'button': { flexShrink: 0 },
}));

const Actions = styled.div({
  display: 'flex', justifyContent: 'flex-end', gap: 12, flexWrap: 'wrap',
  'button': { minHeight: 44, height: 'auto', padding: '10px 18px', whiteSpace: 'normal' },
});

const StatusNote = styled.p(({ theme }) => ({
  margin: '16px 0 0', fontSize: 12, lineHeight: 1.6, color: theme.mixer(0.7),
}));

export default function ModernAccountDetails({ account, stakeInfo }) {
  const balances = [
    [__('Total account balance'), totalBalance(account)],
    [__('Available balance'), account.balance],
    [__('Stake balance'), account.stake],
    [__('Unclaimed balance'), account.unclaimed],
    [__('Unconfirmed balance'), account.unconfirmed],
    [__('Immature balance'), account.immature],
  ].filter(([, value]) => value !== undefined);
  const hasStake = account.stake !== undefined;
  const stakeDisabled = !stakeInfo || (!stakeInfo.stake && !stakeInfo.balance) || stakeInfo.new;
  const dateOptions = { year: 'numeric', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' };

  return (
    <ControlledModal maxWidth={860}>
      {(closeModal) => (
        <>
          <ControlledModal.Header>
            <Heading>
              <div className="eyebrow">{__('Account Details')}</div>
              <h2>{account.name || __('Unnamed')}</h2>
            </Heading>
          </ControlledModal.Header>
          <ControlledModal.Body>
            <BalanceGrid>
              {balances.map(([label, value]) => (
                <BalanceCard key={label}>
                  <div className="label">{label}</div>
                  <div className="balance">
                    <div className="value">{formatNumber(value, 6)}</div>
                    <div className="token"><TokenName account={account} /></div>
                  </div>
                </BalanceCard>
              ))}
            </BalanceGrid>
            <Details>
              <div><dt>{__('Created at')}</dt><dd>{formatDateTime(account.created * 1000, dateOptions)}</dd></div>
              <div><dt>{__('Last modified')}</dt><dd>{formatDateTime(account.modified * 1000, dateOptions)}</dd></div>
              {account.data !== undefined && <div className="data"><dt>{__('Data')}</dt><dd>{typeof account.data === 'object' ? JSON.stringify(account.data, null, 2) : account.data}</dd></div>}
            </Details>
            <Address>
              <h3>{__('Address')}</h3>
              <div className="address-row"><code>{account.address}</code><QRButton address={account.address} /></div>
            </Address>
            {hasStake && stakeDisabled && (
              <StatusNote>
                {!stakeInfo ? __('Loading staking information…') : !stakeInfo.stake && !stakeInfo.balance
                  ? __('Trust Account is empty.')
                  : __('Trust Account must mature for 72 hours before staking')}
              </StatusNote>
            )}
          </ControlledModal.Body>
          <ControlledModal.Footer separator>
            <Actions>
              <Button onClick={closeModal}>{__('Close')}</Button>
              {hasStake && <Button skin="primary" disabled={stakeDisabled} onClick={() => openModal(AdjustStakeModal)}>{__('Adjust stake amount')}</Button>}
              {account.balance > 0 && <Button skin="filled-primary" onClick={() => { closeModal(); goToSend({ sendFrom: `account:${account.address}` }); }}>{__('Send %{token_name}', { token_name: TokenName.from({ account }) })}</Button>}
            </Actions>
          </ControlledModal.Footer>
        </>
      )}
    </ControlledModal>
  );
}
