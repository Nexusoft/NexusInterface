// External
import React from 'react';
import { connect } from 'react-redux';

// Internal
import Text from 'components/Text';
import WaitingMessage from 'components/WaitingMessage';
import { switchSettingsTab } from 'actions/ui';
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
  ({
    core: {
      info: { connections, locked },
    },
  }) => ({
    locked,
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
   * Component's Renderable JSX
   *
   * @returns
   * @memberof SettingsSecurity
   */
  render() {
    const { locked, connections } = this.props;
    if (connections === undefined) {
      return (
        <WaitingMessage>
          _('Connecting to Nexus Core')
          ...
        </WaitingMessage>
      );
    }

    if (locked === undefined) {
      return <Unencrypted />;
    } else if (locked) {
      return <Login />;
    } else {
      return <Encrypted />;
    }
  }
}
export default SettingsSecurity;
