// External Dependencies
import React, { Component } from 'react';

// Internal Global Dependencies
import GA from 'lib/googleAnalytics';
import Panel from 'components/Panel';
import RequireLoggedIn from 'components/RequireLoggedIn';
import { loadAccounts, loadOwnedTokens } from 'lib/user';

// Internal Local Dependencies
import SendForm from './SendForm';

// Resources
import sendIcon from 'icons/send.svg';

__ = __context('Send');

/**
 * Send Page
 *
 * @class Send
 * @extends {Component}
 */
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
    return (
      <Panel icon={sendIcon} title={__('Send')}>
        <RequireLoggedIn>
          <SendForm />
        </RequireLoggedIn>
      </Panel>
    );
  }
}
export default Send;
