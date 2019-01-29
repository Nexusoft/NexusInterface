// External Dependencies
import React, { Component } from 'react';

import { Route, Redirect, Switch } from 'react-router';
import { connect } from 'react-redux';
import Modal from 'react-responsive-modal';

import { remote } from 'electron';
import Countdown from 'react-countdown-now';
import googleanalytics from 'scripts/googleanalytics';

// Internal Global Dependencies
import Panel from 'components/Panel';
import Tab from 'components/Tab';
import UIController from 'components/UIController';
import * as TYPE from 'actions/actiontypes';
import Text from 'components/Text';
import ContextMenuBuilder from 'contextmenu';

// Internal Local Dependencies

import Fast from './Fast';
import Precise from './Precise';

// Images
import shapeshiftIcon from 'images/shapeshift.sprite.svg';
import bullseyeIcon from 'images/bullseye.sprite.svg';
import fastIcon from 'images/fast.sprite.svg';

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
});

class Exchange extends Component {
  // React Method (Life cycle hook)
  componentDidMount() {
    googleanalytics.SendScreen('Exchange');
    window.addEventListener('contextmenu', this.setupcontextmenu, false);
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
                UIController.showNotification('Transaction Expired');
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
    return (
      <Panel icon={shapeshiftIcon} title={<Text id="Exchange.Exchange" />}>
        <Modal
          open={this.props.transactionModalFlag}
          onClose={this.props.clearTransaction}
          center
          classNames={{ modal: 'modal' }}
        >
          {this.modalContents()}
        </Modal>

        <Tab.Bar>
          <Tab
            link={`${this.props.match.url}/Precise`}
            icon={bullseyeIcon}
            text={<Text id="Exchange.Precise" />}
            toolTipText={<Text id="Exchange.PreciseExplanation" />}
          />
          <Tab
            link={`${this.props.match.url}/Fast`}
            icon={fastIcon}
            text={<Text id="Exchange.Fast" />}
            toolTipText={<Text id="Exchange.FastExplanation" />}
          />
        </Tab.Bar>

        <Switch>
          <Redirect
            exact
            from={`${this.props.match.path}/`}
            to={`${this.props.match.path}/Precise`}
          />
          <Route
            path={`${this.props.match.path}/Precise`}
            render={props => <Precise />}
          />
          <Route
            path={`${this.props.match.path}/Fast`}
            render={() => <Fast />}
          />
        </Switch>
      </Panel>
    );
  }
}

// Mandatory React-Redux method
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Exchange);
