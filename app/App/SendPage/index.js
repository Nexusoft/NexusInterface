// External Dependencies
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { remote } from 'electron';

// Internal Global Dependencies
import googleanalytics from 'scripts/googleanalytics';
import ContextMenuBuilder from 'contextmenu';
import Text from 'components/Text';
import Icon from 'components/Icon';
import Panel from 'components/Panel';
import Button from 'components/Button';
import WaitingMessage from 'components/WaitingMessage';
import Tooltip from 'components/Tooltip';
import UIController from 'components/UIController';

// Internal Local Dependencies
import MoveBetweenAccountsModal from './MoveBetweenAccountsModal';
import SendForm from './SendForm';

// Resources
import sendIcon from 'images/send.sprite.svg';
import swapIcon from 'images/swap.sprite.svg';

const mapStateToProps = state => ({
  connections: state.overview.connections,
  isInSync: state.common.isInSync,
});

/**
 * Send Page
 *
 * @class SendPage
 * @extends {Component}
 */
@connect(mapStateToProps)
class SendPage extends Component {
  componentDidMount() {
    window.addEventListener('contextmenu', this.setupcontextmenu, false);
    googleanalytics.SendScreen('Send');
  }

  componentWillUnmount() {
    window.removeEventListener('contextmenu', this.setupcontextmenu);
  }

  /**
   * Set up the context menu
   *
   * @param {*} e
   * @memberof SendPage
   */
  setupcontextmenu(e) {
    e.preventDefault();
    const contextmenu = new ContextMenuBuilder().defaultContext;
    //build default
    let defaultcontextmenu = remote.Menu.buildFromTemplate(contextmenu);
    defaultcontextmenu.popup(remote.getCurrentWindow());
  }

  /**
   * Opens the Move NXS between account modal  
   *
   * @memberof SendPage
   */
  moveBetweenAccounts = () => {
    UIController.openModal(MoveBetweenAccountsModal);
  };

  /**
   * React Render
   *
   * @returns
   * @memberof SendPage
   */
  render() {
    return (
      <Panel
        icon={sendIcon}
        title={<Text id="sendReceive.SendNexus" />}
        controls={
          this.props.connections !== undefined && (
            <Tooltip.Trigger
              tooltip={<Text id="sendReceive.MoveNxsBetweenAccount" />}
            >
              <Button
                square
                skin="primary"
                className="relative"
                onClick={this.moveBetweenAccounts}
              >
                <Icon icon={swapIcon} />
              </Button>
            </Tooltip.Trigger>
          )
        }
      >
        {!this.props.isInSync || this.props.connections === undefined ? (
          <WaitingMessage>
            <Text id="TrustList.SyncMsg" />
            ...
          </WaitingMessage>
        ) : (
          <div>
            <SendForm />

            {this.props.Queue && !!Object.keys(this.props.Queue).length && (
              <Queue
                accHud={this.accHud.bind(this)}
                getAccountData={this.getAccountData}
                {...this.props}
              />
            )}
          </div>
        )}
      </Panel>
    );
  }
}
export default SendPage;