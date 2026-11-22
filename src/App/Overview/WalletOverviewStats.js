import { useSelector } from 'react-redux';
import { isCoreConnected, isLoggedIn, isStaking, isSynchronized, selectBalances } from 'selectors';
import { formatNumber } from 'lib/intl';
import walletIcon from 'icons/wallet.svg';
import networkIcon from 'icons/Connections16.svg';
import contactsIcon from 'icons/address-book.svg';
import tokenIcon from 'icons/supply.svg';
import stakingIcon from 'icons/staking.svg';
import userIcon from 'icons/user.svg';
import Stat from './Stat';

__ = __context('Overview');

export function NetworkStat() {
  const info = useSelector(state => state.core.systemInfo);
  const network = !info ? __('Offline') : info.private ? __('Private')
    : info.testnet ? __('Testnet') : __('Mainnet');
  return <Stat label={__('Network')} icon={networkIcon} linkTo="/Settings/Core">
    {network}
  </Stat>;
}

export function AccountCountStat() {
  const accounts = useSelector(state => state.user.accounts);
  const loggedIn = useSelector(isLoggedIn);
  return <Stat label={__('Wallet accounts')} icon={walletIcon} linkTo="/Wallets">
    {loggedIn && Array.isArray(accounts) ? formatNumber(accounts.length, 0) : '—'}
  </Stat>;
}

export function ContactCountStat() {
  const contacts = useSelector(state => state.addressBook);
  const loggedIn = useSelector(isLoggedIn);
  return <Stat label={__('Saved contacts')} icon={contactsIcon} linkTo="/AddressBook">
    {loggedIn && contacts ? formatNumber(Object.keys(contacts).length, 0) : '—'}
  </Stat>;
}

export function StakingStatusStat() {
  const connected = useSelector(isCoreConnected);
  const loggedIn = useSelector(isLoggedIn);
  const staking = useSelector(isStaking);
  const synced = useSelector(isSynchronized);
  const info = useSelector(state => state.user.stakeInfo);
  const status = !connected ? __('Offline') : !loggedIn ? __('Signed out')
    : !info ? __('Loading...') : !staking ? __('Inactive')
    : !synced ? __('Awaiting sync') : __('Active');
  return <Stat label={__('Staking status')} icon={stakingIcon} linkTo="/Staking">{status}</Stat>;
}

export function LoginStatusStat() {
  const loggedIn = useSelector(isLoggedIn);
  return <Stat label={__('Login status')} icon={userIcon}>
    {loggedIn ? __('Signed in') : __('Signed out')}
  </Stat>;
}

export function TokenCountStat() {
  const [, tokens] = useSelector(selectBalances);
  const loggedIn = useSelector(isLoggedIn);
  const hidden = useSelector(state => state.settings.hideOverviewBalances);
  const held = tokens?.filter(token => (token.balance ?? token.available ?? 0) > 0);
  return <Stat label={__('Tokens held')} icon={tokenIcon} linkTo="/Wallets"
    tooltip={__('Number of custom tokens with a positive balance, excluding NXS.')}>
    {loggedIn && !hidden && held ? formatNumber(held.length, 0) : '\u2014'}
  </Stat>;
}
