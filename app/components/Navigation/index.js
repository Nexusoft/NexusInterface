// External Dependencies
import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import styled from '@emotion/styled';

// Internal Global Depnedencies
import HorizontalLine from 'components/common/HorizontalLine';
import Icon from 'components/common/Icon';

// Internal Local Dependencies
import NavItem from './NavItem';

// Images
import logoIcon from 'images/logo.sprite.svg';
import sendIcon from 'images/send.sprite.svg';
import chartIcon from 'images/chart.sprite.svg';
import transactionsIcon from 'images/transaction.sprite.svg';
import addressBookIcon from 'images/address-book.sprite.svg';
import settingsIcon from 'images/settings.sprite.svg';
import consoleIcon from 'images/console.sprite.svg';
import styleImg from 'images/developer.svg';
import shapeshiftIcon from 'images/shapeshift.sprite.svg';
import trustListIcon from 'images/trust-list.sprite.svg';

const NavWrapper = styled.nav({
  gridArea: 'navigation',
  display: 'flex',
  justifyContent: 'center',
  paddingBottom: 10,
  position: 'relative',
});

const AboveNav = styled.div({
  position: 'absolute',
  bottom: '100%',
  left: 0,
  right: 0,
});

const Navigation = () => (
  <NavWrapper>
    <AboveNav>
      <HorizontalLine />
    </AboveNav>

    <NavItem icon={logoIcon} exact to="/">
      <FormattedMessage id="Footer.Overview" defaultMessage="Overview" />
    </NavItem>

    <NavItem icon={sendIcon} to="/SendRecieve">
      <FormattedMessage id="Footer.Send" defaultMessage="Send" />
    </NavItem>

    <NavItem icon={transactionsIcon} to="/Transactions">
      <FormattedMessage
        id="Footer.Transactions"
        defaultMessage="Transactions"
      />
    </NavItem>

    <NavItem icon={chartIcon} to="/Market">
      <FormattedMessage id="Footer.Market" defaultMessage="Market" />
      &nbsp;
      <FormattedMessage id="Footer.Data" defaultMessage="Data" />
    </NavItem>

    <NavItem icon={addressBookIcon} to="/AddressBook">
      <FormattedMessage id="Footer.Address" defaultMessage="Address" />
      &nbsp;
      <FormattedMessage id="Footer.Book" defaultMessage="Book" />
    </NavItem>

    <NavItem icon={settingsIcon} to="/Settings">
      <FormattedMessage id="Footer.Settings" defaultMessage="Settings" />
    </NavItem>

    <NavItem icon={consoleIcon} to="/Terminal">
      <FormattedMessage id="Footer.Console" defaultMessage="Console" />
    </NavItem>

    <NavItem icon={shapeshiftIcon} to="/Exchange">
      <FormattedMessage id="Footer.Exchange" defaultMessage="Exchange" />
    </NavItem>

    <NavItem icon={trustListIcon} to="/List">
      <FormattedMessage id="Footer.Trust" defaultMessage="Trust" />
      &nbsp;
      <FormattedMessage id="Footer.List" defaultMessage="List" />
    </NavItem>
  </NavWrapper>
);

export default Navigation;
