// External
import React from 'react';
import { connect } from 'react-redux';

// Internal
import Text from 'components/Text';
import WaitingMessage from 'components/WaitingMessage';
import Login from './Login';
import Encrypted from './Encrypted';
import Unencrypted from './Unencrypted';

@connect(({ common: { encrypted, loggedIn }, overview: { connections } }) => ({
  encrypted,
  loggedIn,
  connections,
}))
export default class Security extends React.Component {
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
