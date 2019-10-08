// External Dependencies
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { remote } from 'electron';

// Internal Global Dependencies
import GA from 'lib/googleAnalytics';
import ContextMenuBuilder from 'contextmenu';
import Icon from 'components/Icon';
import Panel from 'components/Panel';
import Button from 'components/Button';
import WaitingMessage from 'components/WaitingMessage';
import Tooltip from 'components/Tooltip';
import { openModal } from 'lib/ui';
import { isCoreConnected } from 'selectors';

// Internal Local Dependencies
import MoveBetweenAccountsModal from './MoveBetweenAccountsModal';
import SendForm from './SendForm';

// Resources
import sendIcon from 'icons/send.svg';
import swapIcon from 'icons/swap.svg';

const mapStateToProps = state => ({
  coreConnected: isCoreConnected(state),
});

/**
 * Send Page
 *
 * @class Send
 * @extends {Component}
 */
@connect(mapStateToProps)
class Send extends Component {
  /**
   * Component Mount Callback
   *
   * @memberof Send
   */
  componentDidMount() {
    window.addEventListener('contextmenu', this.setupcontextmenu, false);
    GA.SendScreen('Send');
  }

  /**
   * Component Unmount Callback
   *
   * @memberof Send
   */
  componentWillUnmount() {
    window.removeEventListener('contextmenu', this.setupcontextmenu);
  }

  /**
   * Set up the context menu
   *
   * @param {*} e
   * @memberof Send
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
   * @memberof Send
   */
  moveBetweenAccounts = () => {
    openModal(MoveBetweenAccountsModal);
  };

  /**
   * Component's Renderable JSX
   *
   * @returns
   * @memberof Send
   */
  render() {
    return (
      <Panel
        icon={sendIcon}
        title={__('Send NXS')}
        controls={
          this.props.coreConnected && (
            <Tooltip.Trigger tooltip={__('Move NXS between accounts')}>
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
        {!this.props.coreConnected ? (
          <WaitingMessage>
            {__('Connecting to Nexus Core')}
            ...
          </WaitingMessage>
        ) : (
          <SendForm />
        )}
      </Panel>
    );
  }
}
export default Send;
