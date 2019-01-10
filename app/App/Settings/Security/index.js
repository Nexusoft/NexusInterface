// External
import React from 'react';
import { connect } from 'react-redux';

import Login from './Login';
import Encrypted from './Encrypted';
import Unencrypted from './Unencrypted';

@connect(({ common: { encrypted, loggedIn } }) => ({
  encrypted,
  loggedIn,
}))
export default class Security extends React.Component {
  render() {
    const { loggedIn, encrypted } = this.props;

    if (!loggedIn) {
      return <Login {...this.props} />;
    }

    if (encrypted) {
      return <Encrypted {...this.props} />;
    } else {
      return <Unencrypted {...this.props} />;
    }
  }
}
