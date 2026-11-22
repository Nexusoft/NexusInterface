import { moduleLayout, moduleAction, modulePanel } from 'utils/moduleStyles';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import styled from '@emotion/styled';

import Icon from 'components/Icon';
import Button from 'components/Button';
import { switchUserTab, openModal } from 'lib/ui';
import { refreshAccounts, refreshOwnedTokens } from 'lib/user';
import plusIcon from 'icons/plus.svg';
import walletIcon from 'icons/wallet.svg';
import checkIcon from 'icons/check.svg';
import { fade } from 'utils/color';

import Account, { accountColumns } from './Account';
import NewAccountModal from 'components/NewAccountModal';
import TabContentWrapper from '../TabContentWrapper';
import { useTheme } from '@emotion/react';

__ = __context('User.Accounts');

const AccountsWrapper = styled(TabContentWrapper)({
  display: 'flex',
  flex: '1 0 auto',
  minWidth: 0,
});

const AccountsContainer = styled.section(({ theme }) => ({
  ...modulePanel(theme),
  borderColor: fade(theme.primary, 0.65),
  width: '100%',
  minWidth: 0,
  padding: moduleLayout.panelPadding,
  display: 'flex', flexDirection: 'column',
  containerType: 'inline-size', containerName: 'user-accounts',
  '.accounts-empty': { padding: '32px 16px', textAlign: 'center', color: theme.mixer(0.65), fontSize: 13 },
  '.accounts-guide': { margin: 'auto 0', padding: '40px 16px', textAlign: 'center', color: theme.mixer(0.7), fontSize: 12, lineHeight: 1.5 },
  '.accounts-guide > svg': { color: theme.mixer(0.6) },
  '.accounts-guide p': { margin: '14px 0 20px' },
  '.accounts-guide ul': { display: 'inline-flex', flexDirection: 'column', gap: 12, margin: 0, padding: 0, listStyle: 'none', textAlign: 'left' },
  '.accounts-guide li': { display: 'flex', alignItems: 'center', gap: 10 },
  '.accounts-guide li svg': { color: theme.primary, flexShrink: 0 },
  '@container user-accounts (max-width: 900px)': {
    '.accounts-guide': { padding: '24px 12px', fontSize: 11 },
    '.accounts-guide > svg': { width: 34, height: 34 },
    '.accounts-guide p': { margin: '10px 0 14px' },
    '.accounts-guide ul': { gap: 8, maxWidth: '100%' },
    '.accounts-guide li': { gap: 8 },
    '.accounts-guide li svg': { width: 14, height: 14 },
  },
  '@container user-accounts (max-width: 600px)': {
    '.accounts-guide': { padding: '18px 4px', fontSize: 10, lineHeight: 1.45 },
    '.accounts-guide > svg': { width: 28, height: 28 },
    '.accounts-guide p': { margin: '8px 0 12px' },
    '.accounts-guide ul': { gap: 6 },
    '.accounts-guide li': { alignItems: 'flex-start', gap: 6 },
    '.accounts-guide li svg': { width: 12, height: 12, marginTop: 1 },
  },
  '@media (max-width: 600px)': { padding: 14 },
}));

const AccountsIntro = styled.div(({ theme }) => ({
  display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between',
  alignItems: 'center',
  gap: 24,
  padding: '0 0 20px',
  borderBottom: `1px solid ${fade(theme.primary, 0.75)}`,
  '.accounts-title': { display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' },
  '.accounts-count': { border: `1px solid ${fade(theme.primary, 0.5)}`, background: fade(theme.primary, 0.94), color: theme.primary, borderRadius: 7, padding: '3px 9px', fontSize: 11 },
  'h2': { display: 'flex', alignItems: 'center', gap: 10, margin: 0, fontSize: moduleLayout.sectionTitleSize, fontWeight: 600, color: theme.foreground },
  'h2 svg': { color: theme.primary, width: 20, height: 20, flexShrink: 0 },
  'p': { margin: '6px 0 0', maxWidth: '70ch', fontSize: 12, lineHeight: 1.5, color: theme.mixer(0.7) },
  '> button': { ...moduleAction, justifySelf: 'end', whiteSpace: 'normal' },
  '@media (max-width: 1100px)': {
    gap: 16,
    padding: '0 0 20px',
  },
  '@media (max-width: 480px)': {
    gap: 12,
    '> button': { maxWidth: 150, height: 'auto', minHeight: 38 },
  },
}));

const AccountScroll = styled.div({
  overflowX: 'auto', minWidth: 0,
});

const AccountGrid = styled.div({
  display: 'flex', flexDirection: 'column', minWidth: 0, width: '100%',
  '@container user-accounts (max-width: 900px)': { '--account-column-gap': '10px' },
  '@container user-accounts (max-width: 600px)': { '--account-column-gap': '6px', '--account-icon-size': '30px', '--account-options-width': '42px' },
});

const AccountHeader = styled.div(({ theme }) => ({
  display: 'grid', gridTemplateColumns: accountColumns, gap: 'var(--account-column-gap, 16px)',
  alignItems: 'center', padding: '14px 8px',
  fontSize: 11, color: theme.mixer(0.65),
  borderBottom: `1px solid ${fade(theme.primary, 0.75)}`,
  '> span': { minWidth: 0, overflowWrap: 'anywhere' },
  '@container user-accounts (max-width: 600px)': { padding: '12px 4px', fontSize: 10 },
  '.balance-heading': { textAlign: 'right' },
}));

export default function Accounts() {
  const { modern } = useTheme();
  const session = useSelector((state) => state.user.session);
  const accounts = useSelector((state) => state.user.accounts);

  useEffect(() => {
    switchUserTab('Accounts');
    refreshAccounts();
    refreshOwnedTokens();
  }, [session]);

  return (
    modern ? (
      <AccountsWrapper>
        <AccountsContainer aria-labelledby="accounts-intro-title">
        <AccountsIntro>
          <div>
          <div className="accounts-title">
            <h2 id="accounts-intro-title">{__('Wallet accounts')}</h2>
            {accounts && <span className="accounts-count">{accounts.length === 1 ? __('1 account') : __('%{count} accounts', { count: accounts.length })}</span>}
          </div>
          <p>{__('Your NXS and token wallets, together in one place.')}</p>
          </div>
          <Button type="button" skin="filled-primary" onClick={() => openModal(NewAccountModal)}>
            <Icon icon={plusIcon} className="mr0_4" />
            {__('New account')}
          </Button>
        </AccountsIntro>
        <AccountScroll tabIndex={0} role="region" aria-label={__('Wallet accounts')}>
        <AccountGrid>
          <AccountHeader>
            <span>{__('Type')}</span>
            <span>{__('Account name')}</span>
            <span>{__('Wallet address')}</span>
            <span className="balance-heading">{__('Balance')}</span>
            <span style={{ textAlign: 'center' }}>{__('Options')}</span>
          </AccountHeader>
          {(accounts || []).map((account) => (
            <Account key={account.name + account.address} account={account} />
          ))}
        </AccountGrid>
        </AccountScroll>
        {!accounts && <p className="accounts-empty" role="status">{__('Loading accounts...')}</p>}
        {accounts?.length === 0 && <p className="accounts-empty">{__('No accounts yet. Create an account to get started.')}</p>}
        {accounts && accounts.length <= 2 && <div className="accounts-guide">
          <Icon icon={walletIcon} size={44} aria-hidden="true" />
          <p>{__('Keep your wallet accounts organized in one place')}</p>
          <ul>
            <li><Icon icon={checkIcon} aria-hidden="true" />{__('Create accounts to organize your funds')}</li>
            <li><Icon icon={checkIcon} aria-hidden="true" />{__('Copy an address or share its QR code to receive funds')}</li>
            <li><Icon icon={checkIcon} aria-hidden="true" />{__('View account details and transaction history')}</li>
          </ul>
        </div>}
        </AccountsContainer>
      </AccountsWrapper>
    ) : (!!accounts && (
      <TabContentWrapper>
        <Button wide onClick={() => openModal(NewAccountModal)}>
          <Icon icon={plusIcon} className="mr0_4" />
          {__('Create new account')}
        </Button>
        <div className="mt1">
          {accounts.map((account) => (
            <Account key={account.name + account.address} account={account} />
          ))}
        </div>
      </TabContentWrapper>
    ))
  );
}
