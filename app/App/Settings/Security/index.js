// External
import React from 'react';
import { connect } from 'react-redux';

// Internal
import Text from 'components/Text';
import WaitingMessage from 'components/WaitingMessage';
import { switchSettingsTab } from 'actions/uiActionCreators';
import Login from './Login';
import Encrypted from './Encrypted';
import Unencrypted from './Unencrypted';

/**
 * SettingsSecurity Page on Settings Page
 *
 * @class SettingsSecurity
 * @extends {React.Component}
 */
@connect(
  ({ common: { encrypted, loggedIn }, overview: { connections } }) => ({
    encrypted,
    loggedIn,
    connections,
  }),
  { switchSettingsTab }
)
class SettingsSecurity extends React.Component {
  /**
   *Creates an instance of SettingsSecurity.
   * @param {*} props
   * @memberof SettingsSecurity
   */
  constructor(props) {
    super(props);
    props.switchSettingsTab('Security');
  }

  /**
   * React Render
   *
   * @returns
   * @memberof SettingsSecurity
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
export default SettingsSecurity;
