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
import { openModal } from 'actions/overlays';

// Internal Local Dependencies
import MoveBetweenAccountsModal from './MoveBetweenAccountsModal';
import SendForm from './SendForm';

// Resources
import sendIcon from 'images/send.sprite.svg';
import swapIcon from 'images/swap.sprite.svg';

const mapStateToProps = state => ({
  connections: state.core.info.connections,
});

const actionCreators = { openModal };

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
    window.addEventListener('contextmenu', this.setupcontextmenu, false);
    googleanalytics.SendScreen('Send');
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
    this.props.openModal(MoveBetweenAccountsModal);
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
        title={_('Send NXS')}
        controls={
          this.props.connections !== undefined && (
            <Tooltip.Trigger tooltip={_('Move NXS between accounts')}>
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
        {!true || this.props.connections === undefined ? (
          <WaitingMessage>
            {_('Connecting to Nexus Core')}
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
