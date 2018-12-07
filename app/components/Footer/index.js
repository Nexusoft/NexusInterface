/*
Title: Footer
Description: Bottom Menu
Last Modified by: Brian Smith
*/
// External Dependencies
import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';

// Internal Global Depnedencies
import HorizontalLine from 'components/common/HorizontalLine';

// Internal Local Dependencies
import './style.css';

// Images
import mainlogo from 'images/logo.svg';
import sendImg from 'images/send.svg';
import marketImg from 'images/market.svg';
import transactionsImg from 'images/transactions.svg';
import addressImg from 'images/addressbook.svg';
import settingsImg from 'images/settings.svg';
import consoleImg from 'images/console.svg';
import styleImg from 'images/developer.svg';
import shapeshift from 'images/shapeshift.svg';
import listImg from 'images/trust-list.svg';
import { FormattedMessage } from 'react-intl';

export default class Footer extends Component {
  // Mandatory React method
  render() {
    return (
      <div id="Footer">
        <HorizontalLine />
        <div id="navigation-mobile" className="animated bounceInUp hidden">
          <NavLink exact to="/">
            <img src={mainlogo} alt="Overview" />
            <div className="tooltip top">
              <FormattedMessage
                id="Footer.Overview"
                defaultMessage="Overview"
              />
            </div>
          </NavLink>
          <NavLink to="/SendRecieve">
            <img src={sendImg} alt="SendRecieve" />
            <div className="tooltip top">
              <FormattedMessage id="Footer.Send" defaultMessage="Send" />
              &nbsp;NXS
            </div>
          </NavLink>
          <NavLink to="/Transactions">
            <img src={transactionsImg} alt="Transactions" />
            <div className="tooltip top">
              <FormattedMessage
                id="Footer.Transactions"
                defaultMessage="Transactions"
              />
            </div>
          </NavLink>
          <NavLink to="/Market">
            <img src={marketImg} alt="Market Data" />
            <div className="tooltip top">
              <FormattedMessage id="Footer.Market" defaultMessage="Market" />
              &nbsp;
              <FormattedMessage id="Footer.Data" defaultMessage="Data" />
            </div>
          </NavLink>
          <NavLink to="/AddressBook">
            <img src={addressImg} alt="Address Book" />
            <div className="tooltip top">
              <FormattedMessage id="Footer.Address" defaultMessage="Address" />
              &nbsp;
              <FormattedMessage id="Footer.Book" defaultMessage="Book" />
            </div>
          </NavLink>
          <NavLink to="/Settings">
            <img src={settingsImg} alt="Settings" />
            <div className="tooltip top">
              <FormattedMessage
                id="Footer.Settings"
                defaultMessage="Settings"
              />
            </div>
          </NavLink>
          <NavLink to="/Terminal">
            <img src={consoleImg} alt="Console" />
            <div className="tooltip top">
              <FormattedMessage id="Footer.Console" defaultMessage="Console" />
            </div>
          </NavLink>

          {/* <NavLink to="/StyleGuide">
            <img src={styleImg} alt="Style Guide" />
            <div className="tooltip top">Style&nbsp;Guide</div>{" "}
          </NavLink> */}
          <NavLink to="/Exchange">
            <img src={shapeshift} alt="Exchange" />
            <div className="tooltip top">
              <FormattedMessage
                id="Footer.Exchange"
                defaultMessage="Exchange"
              />
            </div>
          </NavLink>
          <NavLink to="/List">
            <img src={listImg} alt="Trust List" />
            <div className="tooltip top">
              <FormattedMessage id="Footer.Trust" defaultMessage="Trust" />
              &nbsp; <FormattedMessage id="Footer.List" defaultMessage="List" />
            </div>
          </NavLink>
        </div>
        <div id="navigation" className="animated bounceInUp ">
          <NavLink exact to="/">
            <img src={mainlogo} alt="Overview" />
            <div className="tooltip top" style={{ whiteSpace: 'nowrap' }}>
              <FormattedMessage
                id="Footer.Overview"
                defaultMessage="Overview"
              />
            </div>
          </NavLink>
          <NavLink to="/SendRecieve">
            <img src={sendImg} alt="SendRecieve" />
            <div className="tooltip top" style={{ whiteSpace: 'nowrap' }}>
              <FormattedMessage id="Footer.Send" defaultMessage="Send" />
              &nbsp;NXS
            </div>
          </NavLink>
          <NavLink to="/Transactions">
            <img src={transactionsImg} alt="Transactions" />
            <div className="tooltip top" style={{ whiteSpace: 'nowrap' }}>
              <FormattedMessage
                id="Footer.Transactions"
                defaultMessage="Transactions"
              />
            </div>
          </NavLink>
          <NavLink to="/Market">
            <img src={marketImg} alt="Market Data" />
            <div className="tooltip top" style={{ whiteSpace: 'nowrap' }}>
              <FormattedMessage id="Footer.Market" defaultMessage="Market" />
              &nbsp;
              <FormattedMessage id="Footer.Data" defaultMessage="Data" />
            </div>
          </NavLink>
          <NavLink to="/AddressBook">
            <img src={addressImg} alt="Address Book" />
            <div className="tooltip top" style={{ whiteSpace: 'nowrap' }}>
              <FormattedMessage id="Footer.Address" defaultMessage="Address" />
              &nbsp;
              <FormattedMessage id="Footer.Book" defaultMessage="Book" />
            </div>
          </NavLink>
          <NavLink to="/Settings">
            <img src={settingsImg} alt="Settings" />
            <div className="tooltip top" style={{ whiteSpace: 'nowrap' }}>
              <FormattedMessage
                id="Footer.Settings"
                defaultMessage="Settings"
              />
            </div>
          </NavLink>
          <NavLink to="/Terminal">
            <img src={consoleImg} alt="Console" />
            <div className="tooltip top" style={{ whiteSpace: 'nowrap' }}>
              <FormattedMessage id="Footer.Console" defaultMessage="Console" />
            </div>
          </NavLink>
          {/* <NavLink to="/StyleGuide">
            <img src={styleImg} alt="Style Guide" />
            <div className="tooltip top">Style&nbsp;Guide</div>{" "}
          </NavLink> */}
          <NavLink to="/Exchange">
            <img src={shapeshift} alt="Exchange" />
            <div className="tooltip top" style={{ whiteSpace: 'nowrap' }}>
              <FormattedMessage
                id="Footer.Exchange"
                defaultMessage="Exchange"
              />
            </div>
          </NavLink>
          <NavLink to="/List">
            <img src={listImg} alt="Trust List" />
            <div className="tooltip top" style={{ whiteSpace: 'nowrap' }}>
              <FormattedMessage id="Footer.Trust" defaultMessage="Trust" />
              &nbsp;
              <FormattedMessage id="Footer.List" defaultMessage="List" />
            </div>
          </NavLink>
        </div>
      </div>
    );
  }
}
