// @jsx jsx
// External Dependencies
import React from 'react';
import { connect } from 'react-redux';
import { jsx } from '@emotion/core';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/core';
import { existsSync } from 'fs';
import path from 'path';

// Internal Global Depnedencies
import Text from 'components/Text';
import HorizontalLine from 'components/HorizontalLine';
import Icon from 'components/Icon';
import Tooltip from 'components/Tooltip';
import config from 'api/configuration';
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
import legoBlockIcon from 'images/lego-block.sprite.svg';
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

const iconSize = {
  width: 36,
  height: 36,
};

const NavItem = ({ icon, children, ...rest }) => (
  <Tooltip.Trigger tooltip={children} position="top">
    <NavLinkItem {...rest}>
      <Icon css={iconSize} icon={icon} />
    </NavLinkItem>
  </Tooltip.Trigger>
);

function tryModuleIcon(icon, dirName) {
  const iconPath = path.join(config.GetModulesDir(), dirName, icon);
  return existsSync(iconPath) ? <img css={iconSize} src={iconPath} /> : null;
}

const defaultModuleIcon = <Icon css={iconSize} icon={legoBlockIcon} />;

const ModuleIcon = ({ module }) =>
  (module.icon
    ? tryModuleIcon(module.icon, module.dirName)
    : tryModuleIcon('icon.svg', module.dirName) ||
      tryModuleIcon('icon.png', module.dirName)) || defaultModuleIcon;

const ModuleNavItem = ({ module }) => (
  <Tooltip.Trigger tooltip={module.displayName || module.name} position="top">
    <NavLinkItem to={`/modules/${module.name}`}>
      <ModuleIcon module={module} />
    </NavLinkItem>
  </Tooltip.Trigger>
);

@connect(state => ({
  modules: state.modules,
}))
class ModuleNavItems extends React.Component {
  render() {
    return (
      <>
        {Object.values(this.props.modules)
          .filter(m => m.type === 'page')
          .map(module => (
            <ModuleNavItem key={module.name} module={module} />
          ))}
      </>
    );
  }
}

const Navigation = () => (
  <Nav>
    <AboveNav>
      <HorizontalLine />
    </AboveNav>

    <NavBar>
      <NavItem icon={logoIcon} exact to="/">
        <Text id="Footer.Overview" />
      </NavItem>

      <NavItem icon={sendIcon} to="/SendPage">
        <Text id="Footer.SendNXS" />
      </NavItem>

      <NavItem icon={transactionsIcon} to="/Transactions">
        <Text id="Footer.Transactions" />
      </NavItem>

      <NavItem icon={chartIcon} to="/Market">
        <Text id="Footer.MarketData" />
      </NavItem>

      <NavItem icon={addressBookIcon} to="/AddressBook">
        <Text id="Footer.AddressBook" />
      </NavItem>

      <NavItem icon={settingsIcon} to="/Settings">
        <Text id="Footer.Settings" />
      </NavItem>

      <NavItem icon={consoleIcon} to="/Terminal">
        <Text id="Footer.Console" />
      </NavItem>
      {/* 
      <NavItem icon={shapeshiftIcon} to="/Exchange">
        <Text id="Footer.Exchange" />
      </NavItem> */}

      {/* <NavItem icon={trustListIcon} to="/List">
        <Text id="Footer.Trust" />
        &nbsp;
        <Text id="Footer.List" />
      </NavItem> */}

      <ModuleNavItems />
    </NavBar>
  </Nav>
);

export default Navigation;
