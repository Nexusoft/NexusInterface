/*
Title: Exchange Module
Description: Shapeshift integration
Last Modified by: Brian Smith
*/

// External Dependencies
import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { Route, Redirect } from 'react-router';
import { connect } from 'react-redux';
import Modal from 'react-responsive-modal';
import { Link } from 'react-router-dom';
import Request from 'request';
import { remote } from 'electron';
import Countdown from 'react-countdown-now';

// Internal Dependencies
import { GetSettings } from 'api/settings.js';
import styles from './style.css';
import Fast from './Fast';
import Precise from './Precise';
import * as RPC from 'scripts/rpc';
import * as TYPE from 'actions/actiontypes';
import { FormattedMessage } from 'react-intl';
import ContextMenuBuilder from 'contextmenu';

// Images
import shapeshiftimg from 'images/shapeshift.svg';
import bullseye from 'images/bullseye.svg';
import fastImg from 'images/fast.svg';

// React-Redux mandatory methods
const mapStateToProps = state => {
  return {
    ...state.common,
    ...state.exchange,
  };
};
const mapDispatchToProps = dispatch => ({
  clearTransaction: () => {
    dispatch({ type: TYPE.CLEAR_TRANSACTION });
  },
  emailForRecipt: email => {
    dispatch({ type: TYPE.SET_EMAIL, payload: email });
  },
});

class Exchange extends Component {
  // React Method (Life cycle hook)
  componentDidMount() {
    this.props.googleanalytics.SendScreen('Exchange');
    window.addEventListener('contextmenu', this.setupcontextmenu, false);
    var settingsObj = GetSettings();
    if (settingsObj.email) {
      this.props.emailForRecipt(settingsObj.email);
    }
  }
  // React Method (Life cycle hook)
  componentWillUnmount() {
    window.removeEventListener('contextmenu', this.setupcontextmenu);
  }

  // Class methods
  setupcontextmenu(e) {
    e.preventDefault();
    const contextmenu = new ContextMenuBuilder().defaultContext;
    //build default
    let defaultcontextmenu = remote.Menu.buildFromTemplate(contextmenu);
    defaultcontextmenu.popup(remote.getCurrentWindow());
  }

  modalContents() {
    if (this.props.transaction.expiration) {
      return (
        <div>
          <h2>All right, let's get to it!</h2>
          Now all you have to do is send {
            this.props.transaction.depositAmount
          }{' '}
          {this.props.from} to:
          <br />
          {this.props.transaction.depositAddress}
          <br />
          before the timer runs out and your <br />
          {this.props.transaction.depositAmount} {this.props.from} will be
          shifted at {this.props.transaction.quotedRate} {this.props.to}/
          {this.props.from} to
          <br />
          {this.props.transaction.withdrawalAmount} {this.props.to}
          <br /> <br />
          QUOTE EXPIRES IN:
          <br />
          <Countdown
            date={Date.now() + (this.props.transaction.expiration - Date.now())}
            onComplete={() => this.props.clearTransaction()}
            renderer={({ hours, minutes, seconds, completed }) => {
              if (completed) {
                alert('Transaction Expired');
                return null;
              } else {
                return (
                  <span>
                    {minutes}:{seconds}
                  </span>
                );
              }
            }}
          />
          <br /> <br />
          {/* <button
            className="button primary"
            onClick={() => this.cancelTransaction()}
          >
            Cancel Transaction
          </button> */}
        </div>
      );
    } else {
      return (
        <div>
          <h2>
            Awesome, <br /> Transaction initiated!
          </h2>
          Now all you have to do is send {this.props.ammount}{' '}
          {this.props.transaction.depositType} to:
          <br />
          {this.props.transaction.depositAddress}
          <br />
          and your {this.props.transaction.withdrawalType} will be on its way!
          <br />
          <br />
          P.S. <br /> Here's your order id:
          <br />
          {this.props.transaction.orderId}
          <br />
          Hold on to it, you might need it.
          <br />
          <br />
          {/* {this.props.email !== "" ? (
            <button
              className="button primary"
              onClick={() => this.requestRecipt()}
            >
              Email Receipt?
            </button>
          ) : (
            <div>
              Set your Email in <Link to="/Settings">Settings</Link> to recieve
              email receipts.
            </div>
          )}
          <button
            className="button primary"
            onClick={() => this.cancelTransaction()}
          >
            Cancel Transaction
          </button> */}
        </div>
      );
    }
  }

  // Mandatory React method
  render() {
    // Redirect to application settings if the pathname matches the url (eg: /Settings = /Settings)
    if (this.props.location.pathname === this.props.match.url) {
      return <Redirect to={`${this.props.match.url}/Precise`} />;
    }

    return (
      <div id="Exchange" className="animated fadeIn">
        <Modal
          open={this.props.transactionModalFlag}
          onClose={this.props.clearTransaction}
          center
          classNames={{ modal: 'modal' }}
        >
          {this.modalContents()}
        </Modal>

        <div id="Exchange-container">
          <div>
            <h2>
              <img src={shapeshiftimg} className="hdr-img" />
              <FormattedMessage
                id="Exchange.Exchange"
                defaultMessage="Exchange"
              />
            </h2>
            <p>
              <FormattedMessage
                id="Exchange.ShoutOut"
                defaultMessage="powered by ShapeShift"
              />
            </p>
          </div>
          <div className="panel">
            <ul className="tabs">
              <li>
                <NavLink to={`${this.props.match.url}/Precise`}>
                  <img src={bullseye} alt="Precise" />
                  <FormattedMessage
                    id="Exchange.Precise"
                    defaultMessage="Precise"
                  />
                </NavLink>
              </li>
              <li>
                <NavLink to={`${this.props.match.url}/Fast`}>
                  <img src={fastImg} alt="Fast" />
                  <FormattedMessage id="Exchange.Fast" defaultMessage="Fast" />
                </NavLink>
              </li>
            </ul>

            <div className="grid-container">
              <Route
                exact
                path={`${this.props.match.path}/`}
                render={() => <Precise />}
              />
              <Route
                path={`${this.props.match.path}/Precise`}
                render={props => <Precise />}
              />
              <Route
                path={`${this.props.match.path}/Fast`}
                render={() => <Fast />}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

// Mandatory React-Redux method
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Exchange);
