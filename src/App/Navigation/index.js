import { useState } from 'react';
import { useSelector } from 'react-redux';
import styled from '@emotion/styled';

import Icon from 'components/Icon';
import Tooltip from 'components/Tooltip';
import ModuleIcon from 'components/ModuleIcon';
import { selectModuleUpdateCount } from 'selectors';

import logoIcon from 'icons/logo.svg';
import sendIcon from 'icons/send.svg';
import transactionsIcon from 'icons/transaction.svg';
import addressBookIcon from 'icons/address-book.svg';
import settingsIcon from 'icons/settings.svg';
import consoleIcon from 'icons/console.svg';
import userIcon from 'icons/user.svg';
import walletIcon from 'icons/wallet.svg';
import stakingIcon from 'icons/staking.svg';
import registryIcon from 'icons/blockexplorer-invert-white.svg';

import NavLinkItem from './NavLinkItem';
import { fade, mix } from 'utils/color';
import { keyframes } from '@emotion/react';
import HorizontalLine from 'components/HorizontalLine';
import { consts } from 'styles';
import { timing } from 'styles';
import themeStyles from 'utils/themeStyles';
import { useTheme } from '@emotion/react';
const slideUp = keyframes`
  from { opacity: 0; transform: translateY(70%) }
    to { opacity: 1; transform: translateY(0) }
`;
const AboveNav = styled.div({
  position: 'absolute',
  bottom: '100%',
  left: 0,
  right: 0,
});

__ = __context('NavigationBar');

const Nav = styled.nav(themeStyles([{
  gridArea: 'navigation',
  position: 'relative',
  background: 'linear-gradient(to top, rgba(0,0,0,.6), transparent)'
}], [({
  theme,
  expanded
}) => ({
  gridArea: 'navigation',
  minHeight: 0,
  background: `linear-gradient(180deg, ${mix(theme.background, theme.primary, 0.04)}, ${theme.background})`,
  borderRight: `1px solid ${fade(theme.primary, 0.83)}`,
  overflow: 'hidden',
  zIndex: 2,
  '.settings-button': {
    border: `1px solid ${fade(theme.primary, 0.8)}`
  },
  ...(!expanded && {
    'button[aria-controls="wallet-navigation"]': {
      width: 'calc(100% + 12px)',
      marginLeft: -6,
      marginRight: -6,
      borderRadius: 0
    },
    '.nav-label': {
      display: 'none'
    },
    'a': {
      justifyContent: 'center',
      padding: '12px 8px'
    }
  }),
  '@media (max-width: 600px)': {
    width: expanded ? 208 : 56,
    boxShadow: expanded ? '12px 0 30px rgba(0,0,0,0.35)' : 'none'
  }
})]));

const RevealArea = styled.div(({ autoHide, expanded, dismissed }) => autoHide ? ({
  position: 'fixed', top: 0, bottom: 0, left: 0, width: 8, zIndex: 20,
  '> nav': {
    position: 'absolute', top: 0, bottom: 0, left: 0,
    width: expanded ? 208 : 64,
    transform: 'translateX(-100%)', transition: 'transform 180ms ease-out',
    boxShadow: '12px 0 30px rgba(0,0,0,0.35)',
  },
  '&:hover > nav, &:focus-within > nav': {
    transform: dismissed ? 'translateX(-100%)' : 'translateX(0)',
  },
  '> button': {
    position: 'absolute', inset: 0, width: 8, padding: 0,
    border: 0, background: 'transparent', cursor: 'pointer',
  },
  '@media (max-width: 600px)': { '> nav': { width: expanded ? 208 : 56 } },
}) : ({ display: 'contents' }));

const NavBar = styled.div(themeStyles([{
  width: '100%',
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  paddingBottom: 10,
  animation: `${slideUp} ${timing.slow} ${consts.enhancedEaseOut}`
}], [{
  height: '100%',
  minHeight: 0,
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  padding: '0 6px 12px',
  '#wallet-navigation': {
    display: 'flex', flexDirection: 'column', gap: 8,
    flex: '1 1 0', minHeight: 0, minWidth: 0,
    overflowY: 'auto', overflowX: 'hidden',
    overscrollBehaviorY: 'contain',
    '> *': { flexShrink: 0 },
  }
}]));

const MenuToggle = styled.button(({ theme }) => ({
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
  width: '100%', height: 'var(--header-height)', flexShrink: 0,
  boxSizing: 'border-box', padding: 8, borderRadius: 6,
  border: `1px solid ${fade(theme.primary, 0.8)}`,
  background: 'transparent', color: theme.primary, cursor: 'pointer',
  '&[aria-expanded="true"]': {
    justifyContent: 'flex-start',
    padding: '0 12px',
    gap: 11,
    fontSize: 12,
    fontWeight: 500,
  },
  '&:hover': { background: fade(theme.primary, 0.9) },
}));

const Badge = styled.div(({ theme }) => ({
  position: 'absolute',
  top: '0.4em',
  right: '0.4em',
  background: theme.primary,
  color: theme.primaryAccent,
  fontSize: 13,
  height: '1.4em',
  width: '1.4em',
  borderRadius: '50%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}));

/**
 * Returns a Nav Item
 * These are prebuild modules
 * @param {*} { icon, children, ...rest }
 * @memberof Navigation
 */
const NavItem = ({ icon, children, badge, expanded = false, ...rest }) => {
  const { modern } = useTheme();
  return modern ? (<Tooltip.Trigger tooltip={expanded ? undefined : children} position="right">
    <NavLinkItem aria-label={children} {...rest}>
      <Icon icon={icon} />
      <span className="nav-label">{children}</span>
      {!!badge && <Badge>{badge}</Badge>}
    </NavLinkItem>
  </Tooltip.Trigger>) : (<Tooltip.Trigger tooltip={children} position="top">
    <NavLinkItem {...rest}>
      <Icon icon={icon} />
      {!!badge && <Badge>{badge}</Badge>}
    </NavLinkItem>
  </Tooltip.Trigger>);
};

/**
 * Returns a Module Nav Item
 * These are nave items for user installed Modules
 * @param {*} { module }
 * @memberof Navigation
 */
const ModuleNavItem = ({ module, expanded = false }) => {
  const { modern } = useTheme();
  return modern ? (<Tooltip.Trigger tooltip={expanded ? undefined : module.info.displayName} position="right">
    <NavLinkItem aria-label={module.info.displayName} to={`/Modules/${module.info.name}`}>
      <ModuleIcon module={module} style={{ fontSize: 22, flexShrink: 0 }} />
      <span className="nav-label">{module.info.displayName}</span>
    </NavLinkItem>
  </Tooltip.Trigger>) : (<Tooltip.Trigger tooltip={module.info.displayName} position="top">
    <NavLinkItem to={`/Modules/${module.info.name}`}>
      <ModuleIcon module={module} />
    </NavLinkItem>
  </Tooltip.Trigger>);
};

function ModuleNavItems({ expanded = false }) {
  const modules = useSelector((state) => state.modules);
  return Object.values(modules)
    .filter((module) => module.enabled && module.info.type === 'app')
    .map((module) => <ModuleNavItem key={module.info.name} module={module} expanded={expanded} />);
}

/**
 * Returns the Navigation Bar
 *  @memberof Navigation
 */
export default function Navigation({ expanded, onToggle, autoHide = false }) {
  const [dismissed, setDismissed] = useState(false);
  const { modern } = useTheme();
  const updateCount = useSelector(selectModuleUpdateCount);
  const enableStaking = useSelector((state) => state.settings.enableStaking);
  const devMode = useSelector((state) => state.settings.devMode);
  return (
    modern ? (<RevealArea
      autoHide={autoHide}
      expanded={expanded}
      dismissed={dismissed}
      onMouseLeave={() => setDismissed(false)}
      onFocusCapture={() => setDismissed(false)}
      onClick={(event) => {
        if (!autoHide || !event.target.closest('a[href]')) return;
        setDismissed(true);
        const activeElement = event.currentTarget.ownerDocument.activeElement;
        if (event.currentTarget.contains(activeElement)) activeElement.blur();
      }}
    >
      {autoHide && <button type="button" aria-label={__('Show navigation')} aria-controls="wallet-navigation" />}
      <Nav expanded={expanded} aria-label={__('Navigation')}>

      <NavBar>
        <MenuToggle type="button" onClick={onToggle} aria-expanded={expanded} aria-controls="wallet-navigation" aria-label={expanded ? __('Collapse menu') : __('Expand menu')} title={expanded ? undefined : __('Expand menu')}>
          <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0, fill: 'none', stroke: 'currentColor', strokeWidth: 1.5 }}>
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          {expanded && <span>{__('Collapse menu')}</span>}
        </MenuToggle>
        <div id="wallet-navigation">
        <NavItem expanded={expanded} icon={logoIcon} end to="/">
          {__('Overview')}
        </NavItem>

        {
          <NavItem expanded={expanded} icon={userIcon} to="/User">
            {__('User')}
          </NavItem>
        }

        <NavItem expanded={expanded} icon={walletIcon} to="/Wallets">
          {__('Wallets')}
        </NavItem>

        <NavItem expanded={expanded} icon={sendIcon} to="/Send">
          {__('Send')}
        </NavItem>

        <NavItem expanded={expanded} icon={addressBookIcon} to="/AddressBook">
          {__('Address Book')}
        </NavItem>

        <NavItem expanded={expanded} icon={transactionsIcon} to="/Transactions">
          {__('Transactions')}
        </NavItem>

        {enableStaking && <NavItem expanded={expanded} icon={stakingIcon} to="/Staking">
          {__('Staking')}
        </NavItem>}

        <NavItem expanded={expanded} icon={registryIcon} to="/Registry">
          {__('Registry')}
        </NavItem>

        {devMode && (
          <NavItem expanded={expanded} icon={consoleIcon} to="/Terminal">
            {__('Console')}
          </NavItem>
        )}
        <ModuleNavItems expanded={expanded} />
        <div style={{ marginTop: 'auto' }}>
        <NavItem expanded={expanded} className="settings-button" icon={settingsIcon} to="/Settings" badge={updateCount}>
          {__('Settings')}
        </NavItem>
        </div>
        </div>
      </NavBar>
    </Nav></RevealArea>) : (<Nav>
      <AboveNav>
        <HorizontalLine />
      </AboveNav>

      <NavBar>
        <NavItem icon={logoIcon} end to="/">
          {__('Overview')}
        </NavItem>

        {
          <NavItem icon={userIcon} to="/User">
            {__('User')}
          </NavItem>
        }

        <NavItem icon={walletIcon} to="/Wallets">
          {__('Wallets')}
        </NavItem>

        <NavItem icon={sendIcon} to="/Send">
          {__('Send')}
        </NavItem>

        <NavItem icon={addressBookIcon} to="/AddressBook">
          {__('Address Book')}
        </NavItem>

        <NavItem icon={transactionsIcon} to="/Transactions">
          {__('Transactions')}
        </NavItem>

        {enableStaking && <NavItem icon={stakingIcon} to="/Staking">
          {__('Staking')}
        </NavItem>}

        <NavItem icon={registryIcon} to="/Registry">
          {__('Registry')}
        </NavItem>

        <NavItem icon={settingsIcon} to="/Settings" badge={updateCount}>
          {__('Settings')}
        </NavItem>

        {devMode && (
          <NavItem icon={consoleIcon} to="/Terminal">
            {__('Console')}
          </NavItem>
        )}
        <ModuleNavItems />
      </NavBar>
    </Nav>)
  );
}
