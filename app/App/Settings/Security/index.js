// External
import React from 'react';
import { connect } from 'react-redux';

// Internal
import Text from 'components/Text';
import WaitingMessage from 'components/WaitingMessage';
import Login from './Login';
import Encrypted from './Encrypted';
import Unencrypted from './Unencrypted';

/**
 * Security Page on Settings Page
 *
 * @class Security
 * @extends {React.Component}
 */
@connect(({ common: { encrypted, loggedIn }, overview: { connections } }) => ({
  encrypted,
  loggedIn,
  connections,
}))
class Security extends React.Component {
  /**
   * React Render
   *
   * @returns
   * @memberof Security
   */
  render() {
    const { loggedIn, encrypted, connections } = this.props;
    if (connections === undefined) {
      return (
        <WaitingMessage>
          <Text id="transactions.Loading" />
          ...
        </WaitingMessage>
      );
    }

    if (!loggedIn) {
      return <Login />;
    }

    if (encrypted) {
      return <Encrypted />;
    } else {
      return <Unencrypted />;
    }
  }
}
export default Security;