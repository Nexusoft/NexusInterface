import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { useAtomValue } from 'jotai';

import HorizontalLine from 'components/HorizontalLine';
import Icon from 'components/Icon';
import Tooltip from 'components/Tooltip';
import ModuleIcon from 'components/ModuleIcon';
import { consts, timing } from 'styles';
import { modulesAtom, moduleUpdateCountAtom } from 'lib/modules';

import logoIcon from 'icons/logo.svg';
import sendIcon from 'icons/send.svg';
import transactionsIcon from 'icons/transaction.svg';
import addressBookIcon from 'icons/address-book.svg';
import settingsIcon from 'icons/settings.svg';
import consoleIcon from 'icons/console.svg';
import userIcon from 'icons/user.svg';

import NavLinkItem from './NavLinkItem';

__ = __context('NavigationBar');

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(70%) }
    to { opacity: 1; transform: translateY(0) }
`;

const Nav = styled.nav({
  gridArea: 'navigation',
  position: 'relative',
  background: 'linear-gradient(to top, rgba(0,0,0,.6), transparent)',
});

const NavBar = styled.div({
  width: '100%',
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  paddingBottom: 10,
  animation: `${slideUp} ${timing.slow} ${consts.enhancedEaseOut}`,
});

const AboveNav = styled.div({
  position: 'absolute',
  bottom: '100%',
  left: 0,
  right: 0,
});

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
const NavItem = ({ icon, children, badge, ...rest }) => (
  <Tooltip.Trigger tooltip={children} position="top">
    <NavLinkItem {...rest}>
      <Icon icon={icon} />
      {!!badge && <Badge>{badge}</Badge>}
    </NavLinkItem>
  </Tooltip.Trigger>
);

/**
 * Returns a Module Nav Item
 * These are nave items for user installed Modules
 * @param {*} { module }
 * @memberof Navigation
 */
const ModuleNavItem = ({ module }) => (
  <Tooltip.Trigger tooltip={module.info.displayName} position="top">
    <NavLinkItem to={`/Modules/${module.info.name}`}>
      <ModuleIcon module={module} />
    </NavLinkItem>
  </Tooltip.Trigger>
);

function ModuleNavItems() {
  const modules = useAtomValue(modulesAtom);
  return modules
    .filter((module) => module.enabled && module.info.type === 'app')
    .map((module) => <ModuleNavItem key={module.info.name} module={module} />);
}

/**
 * Returns the Navigation Bar
 *  @memberof Navigation
 */
export default function Navigation() {
  const updateCount = useAtomValue(moduleUpdateCountAtom);
  return (
    <Nav>
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

        <NavItem icon={sendIcon} to="/Send">
          {__('Send')}
        </NavItem>

        <NavItem icon={transactionsIcon} to="/Transactions">
          {__('Transactions')}
        </NavItem>

        <NavItem icon={addressBookIcon} to="/AddressBook">
          {__('Address Book')}
        </NavItem>

        <NavItem icon={settingsIcon} to="/Settings" badge={updateCount}>
          {__('Settings')}
        </NavItem>

        <NavItem icon={consoleIcon} to="/Terminal">
          {__('Console')}
        </NavItem>
        <ModuleNavItems />
      </NavBar>
    </Nav>
  );
}
