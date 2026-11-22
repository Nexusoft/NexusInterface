import styled from '@emotion/styled';

import NexusAddress from 'components/NexusAddress';
import QRButton from 'components/QRButton';
import TokenName from 'components/TokenName';
import Dropdown from 'components/Dropdown';
import Icon from 'components/Icon';
import Button from 'components/Button';
import { formatNumber } from 'lib/intl';
import { openModal, showNotification } from 'lib/ui';
import { clipboard } from 'electron';
import walletIcon from 'icons/wallet.svg';
import logoIcon from 'icons/logo.svg';
import RegistryIcon from '../../Registry/RegistryIcon';
import ellipsisIcon from 'icons/ellipsis.svg';

import AccountDetailsModal from './AccountDetailsModal';
import AccountHistoryModal from './AccountHistoryModal';
import RenameAccountModal from './RenameAccountModal';
import { totalBalance } from './utils';
import { fade } from 'utils/color';
import themeStyles from 'utils/themeStyles';
import { useTheme } from '@emotion/react';

__ = __context('User.Accounts');

export const accountColumns = 'var(--account-icon-size, 44px) minmax(0, 0.7fr) minmax(0, 2fr) minmax(0, 0.65fr) var(--account-options-width, 84px)';

const AccountComponent = styled.div(themeStyles([({
  theme
}) => ({
  padding: '1em 0 3em'
})], [({
  theme
}) => ({
  display: 'grid', gridTemplateColumns: accountColumns, alignItems: 'center', gap: 'var(--account-column-gap, 16px)',
  padding: '20px 8px', minWidth: 0, borderBottom: `1px solid ${fade(theme.primary, 0.75)}`,
  transition: 'background-color 150ms ease, box-shadow 150ms ease',
  '&:hover, &:focus-within': { backgroundColor: fade(theme.primary, 0.94), boxShadow: `inset 2px 0 ${theme.primary}` },
  '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
  '.account-symbol': { display: 'grid', placeItems: 'center', width: 'var(--account-icon-size, 44px)', height: 'var(--account-icon-size, 44px)', borderRadius: 10, border: `1px solid ${fade(theme.primary, 0.5)}`, background: fade(theme.primary, 0.95), color: theme.primary },
  '.account-identity': { display: 'contents' },
  '.account-field': { minWidth: 0 },
  '.account-name, .account-address': { display: 'block', border: 0, background: 'transparent', font: 'inherit', padding: 0, textAlign: 'left', cursor: 'pointer', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  '.account-name': { color: theme.foreground, fontSize: 14, fontWeight: 600 },
  '.account-address': { color: '#ffffff', fontSize: 12, lineHeight: 1.75, whiteSpace: 'normal', overflowWrap: 'anywhere', overflow: 'visible', textOverflow: 'clip' },
  '.account-name:hover, .account-address:hover': { color: theme.primary },
  '.account-balance': { minWidth: 0, fontSize: 14, fontWeight: 600, color: theme.foreground, fontVariantNumeric: 'tabular-nums', whiteSpace: 'normal', overflowWrap: 'anywhere', textAlign: 'right' },
  '.account-actions': { display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 0, gap: 4, paddingLeft: 8, borderLeft: `1px solid ${fade(theme.primary, 0.6)}` },
  '.account-actions svg': { width: 18, height: 18 },
  '@container user-accounts (max-width: 600px)': { padding: '14px 4px', '.account-name, .account-balance': { fontSize: 12 }, '.account-address': { fontSize: 11, lineHeight: 1.5 }, '.account-actions': { flexDirection: 'column', paddingLeft: 0, borderLeft: 0 }, '.account-symbol svg': { width: 20, height: 20 } },
  'button:focus-visible': { outline: `2px solid ${theme.primary}`, outlineOffset: 3 },

})]));

const AccountInfo = styled.div(themeStyles([{
  cursor: 'pointer'
}], [{
  cursor: 'pointer',
  minWidth: 0,
  overflowWrap: 'anywhere',
  alignSelf: 'center'
}]));

const AccountName = styled.span(({ theme }) => ({
  fontWeight: 'bold',
  color: theme.foreground,
}));

export default function Account({ account }) {
  const { modern } = useTheme();
  const isNxs = String(account.token) === '0';
  const tokenName = account.ticker || account.token_name;
  const accountType = isNxs ? 'NXS' : tokenName ? __('%{name} token', { name: tokenName }) : __('Unnamed token');
  return (
    modern ? (<AccountComponent>
        <span className="account-symbol" role="img" aria-label={accountType}>{isNxs ? <Icon icon={logoIcon} size={24} /> : <RegistryIcon section="Tokens" size={24} />}</span>
      <div className="account-identity">
        <div className="account-field">
        <button type="button" className="account-name" title={account.name || __('Unnamed account')} onClick={() => openModal(AccountDetailsModal, { account })}>{account.name || __('Unnamed account')}</button>
        </div>
        <div className="account-field">
        <button type="button" className="account-address" title={__('Copy wallet address')} aria-label={__('Copy account address')} onClick={() => { clipboard.writeText(account.address); showNotification(__('Address has been copied to clipboard'), 'success'); }}>{account.address}</button>
        </div>
      </div>
      <div className="account-balance">{formatNumber(totalBalance(account))} <TokenName account={account} /></div>
      <div className="account-actions">
          <QRButton address={account.address} />
          <Dropdown
            dropdown={({ closeDropdown }) => (
              <>
                <Dropdown.MenuItem
                  onClick={() => {
                    closeDropdown();
                    openModal(AccountDetailsModal, { account });
                  }}
                >
                  {__('Details')}
                </Dropdown.MenuItem>
                {account.name !== 'default' && account.name !== 'trust' && (
                  <Dropdown.MenuItem
                    onClick={() => {
                      closeDropdown();
                      openModal(RenameAccountModal, { account });
                    }}
                  >
                    {__('Rename')}
                  </Dropdown.MenuItem>
                )}
                <Dropdown.MenuItem
                  onClick={() => {
                    closeDropdown();
                    openModal(AccountHistoryModal, { account });
                  }}
                >
                  {__('Transaction History')}
                </Dropdown.MenuItem>
              </>
            )}
          >
            {({ open, controlRef, openDropdown }) => (
              <Button
                type="button" skin="plain" square={32}
                aria-label={__('Account actions')} aria-haspopup="true" aria-expanded={open}
                ref={controlRef}
                onClick={openDropdown}
                className={open ? 'hover' : undefined}
              >
                <Icon icon={ellipsisIcon} style={{ transform: 'rotate(90deg)' }} />
              </Button>
            )}
          </Dropdown>
      </div>
    </AccountComponent>) : (<AccountComponent>
      <div className="flex space-between">
        <AccountInfo>
          <Icon icon={walletIcon} className="mr0_4" />
          <span
            className="v-align"
            onClick={() => {
              openModal(AccountDetailsModal, { account });
            }}
          >
            <strong>
              {account.name ? (
                <AccountName>{account.name}</AccountName>
              ) : (
                <em className="semi-dim">{__('Unnamed account')}</em>
              )}
            </strong>

            <span>
              {' '}
              ({formatNumber(totalBalance(account))}{' '}
              <TokenName account={account} />)
            </span>
          </span>
        </AccountInfo>
        <div className="flex center">
          <QRButton address={account.address} className="mr0_4" />
          <Dropdown
            dropdown={({ closeDropdown }) => (
              <>
                <Dropdown.MenuItem
                  onClick={() => {
                    closeDropdown();
                    openModal(AccountDetailsModal, { account });
                  }}
                >
                  {__('Details')}
                </Dropdown.MenuItem>
                {account.name !== 'default' && account.name !== 'trust' && (
                  <Dropdown.MenuItem
                    onClick={() => {
                      closeDropdown();
                      openModal(RenameAccountModal, { account });
                    }}
                  >
                    {__('Rename')}
                  </Dropdown.MenuItem>
                )}
                <Dropdown.MenuItem
                  onClick={() => {
                    closeDropdown();
                    openModal(AccountHistoryModal, { account });
                  }}
                >
                  {__('Transaction History')}
                </Dropdown.MenuItem>
              </>
            )}
          >
            {({ open, controlRef, openDropdown }) => (
              <Button
                skin="plain"
                fitHeight
                ref={controlRef}
                onClick={openDropdown}
                className={open ? 'hover' : undefined}
              >
                <Icon icon={ellipsisIcon} />
              </Button>
            )}
          </Dropdown>
        </div>
      </div>
      <NexusAddress className="mt1" address={account.address} />
    </AccountComponent>)
  );
}
