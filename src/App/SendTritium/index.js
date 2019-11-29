// External Dependencies
import React, { Component } from 'react';
import { connect } from 'react-redux';

// Internal Global Dependencies
import GA from 'lib/googleAnalytics';
import Panel from 'components/Panel';
import WaitingMessage from 'components/WaitingMessage';
import LoginModal from 'components/LoginModal';
import Button from 'components/Button';
import { openModal } from 'lib/ui';
import { loadAccounts, loadOwnedTokens } from 'lib/user';
import { isCoreConnected, isLoggedIn } from 'selectors';

// Internal Local Dependencies
import SendForm from './SendForm';

// Resources
import sendIcon from 'icons/send.svg';

__ = __context('Send');

const mapStateToProps = state => ({
  coreConnected: isCoreConnected(state),
  loggedIn: isLoggedIn(state),
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
    loadAccounts();
    loadOwnedTokens();
    GA.SendScreen('Send');
  }

  /**
   * Component's Renderable JSX
   *
   * @returns
   * @memberof Send
   */
  render() {
    const { coreConnected, loggedIn } = this.props;
    return (
      <Panel icon={sendIcon} title={__('Send')}>
        {!coreConnected ? (
          <WaitingMessage>
            {__('Connecting to Nexus Core')}
            ...
          </WaitingMessage>
        ) : !loggedIn ? (
          <div style={{ marginTop: 50, textAlign: 'center' }}>
            <Button
              uppercase
              skin="primary"
              onClick={() => {
                openModal(LoginModal);
              }}
            >
              {__('Log in')}
            </Button>
          </div>
        ) : (
          <SendForm />
        )}
      </Panel>
    );
  }
}
export default Send;
