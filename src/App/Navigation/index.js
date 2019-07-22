// External Dependencies
import React from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/core';

// Internal Global Depnedencies
import Text from 'components/Text';
import HorizontalLine from 'components/HorizontalLine';
import Icon from 'components/Icon';
import Tooltip from 'components/Tooltip';
import ModuleIcon from 'components/ModuleIcon';
import { getActiveModules } from 'lib/modules';
import { consts, timing } from 'styles';

// Internal Local Dependencies
import NavLinkItem from './NavLinkItem';

// Images
import logoIcon from 'images/logo.sprite.svg';
import sendIcon from 'images/send.sprite.svg';
import chartIcon from 'images/chart.sprite.svg';
import transactionsIcon from 'images/transaction.sprite.svg';
import addressBookIcon from 'images/address-book.sprite.svg';
import settingsIcon from 'images/settings.sprite.svg';
import consoleIcon from 'images/console.sprite.svg';
// import shapeshiftIcon from 'images/shapeshift.sprite.svg';
// import trustListIcon from 'images/trust-list.sprite.svg';

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

/**
 * Returns a Nav Item
 * These are prebuild modules
 * @param {*} { icon, children, ...rest }
 * @memberof Navigation
 */
const NavItem = ({ icon, children, ...rest }) => (
  <Tooltip.Trigger tooltip={children} position="top">
    <NavLinkItem {...rest}>
      <Icon icon={icon} />
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
  <Tooltip.Trigger tooltip={module.displayName} position="top">
    <NavLinkItem to={`/Modules/${module.name}`}>
      <ModuleIcon module={module} />
    </NavLinkItem>
  </Tooltip.Trigger>
);

const ModuleNavItems = connect(
  state => ({
    modules: getActiveModules(state.modules, state.settings.disabledModules),
  }),
  null,
  null
  // { pure: false }
)(({ modules }) =>
  modules
    .filter(module => module.type === 'app')
    .map(module => <ModuleNavItem key={module.name} module={module} />)
);

/**
 * Returns the Navigation Bar
 *  @memberof Navigation
 */
const Navigation = () => (
  <Nav>
    <AboveNav>
      <HorizontalLine />
    </AboveNav>

    <NavBar>
      <NavItem icon={logoIcon} exact to="/">
        {_('Overview')}
      </NavItem>

      <NavItem icon={sendIcon} to="/Send">
        {_('Send NXS')}
      </NavItem>

      <NavItem icon={transactionsIcon} to="/Transactions">
        {_('Transactions')}
      </NavItem>

      <NavItem icon={chartIcon} to="/Market">
        {_('Market Data')}
      </NavItem>

      <NavItem icon={addressBookIcon} to="/AddressBook">
        {_('Address Book')}
      </NavItem>

      <NavItem icon={settingsIcon} to="/Settings">
        {_('Settings')}
      </NavItem>

      <NavItem icon={consoleIcon} to="/Terminal">
        {_('Console')}
      </NavItem>

      <ModuleNavItems />
    </NavBar>
  </Nav>
);

/**
 *  @class Navigation
 */
export default Navigation;
