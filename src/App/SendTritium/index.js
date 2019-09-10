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
import { openModal } from 'actions/overlays';
import { LoadTritiumAccounts } from 'actions/account';
import { isCoreConnected } from 'selectors';

// Internal Local Dependencies
import SendForm from './SendForm';

// Resources
import sendIcon from 'images/send.sprite.svg';
import swapIcon from 'images/swap.sprite.svg';

const mapStateToProps = state => ({
  coreConnected: isCoreConnected(state),
});

const actionCreators = { openModal, LoadTritiumAccounts };

/**
 * Send Page
 *
 * @class Send
 * @extends {Component}
 */
@connect(
  mapStateToProps,
  actionCreators
)
class Send extends Component {
  /**
   * Component Mount Callback
   *
   * @memberof Send
   */
  componentDidMount() {
    this.props.LoadTritiumAccounts();
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
   * Component's Renderable JSX
   *
   * @returns
   * @memberof Send
   */
  render() {
    return (
      <Panel icon={sendIcon} title={__('Send NXS Tritium')}>
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
