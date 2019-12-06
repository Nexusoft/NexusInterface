// External
import React from 'react';
import { connect } from 'react-redux';

// Internal
import RequireCoreConnected from 'components/RequireCoreConnected';
import { switchSettingsTab } from 'lib/ui';

import Login from './Login';
import Encrypted from './Encrypted';
import Unencrypted from './Unencrypted';

__ = __context('Settings.Security');

/**
 * SettingsSecurity Page on Settings Page
 *
 * @class SettingsSecurity
 * @extends {React.Component}
 */
@connect(state => ({
  locked: state.core.info.locked,
}))
class SettingsSecurity extends React.Component {
  /**
   *Creates an instance of SettingsSecurity.
   * @param {*} props
   * @memberof SettingsSecurity
   */
  constructor(props) {
    super(props);
    switchSettingsTab('Security');
  }

  /**
   * Component's Renderable JSX
   *
   * @returns
   * @memberof SettingsSecurity
   */
  render() {
    const { locked } = this.props;

    return (
      <RequireCoreConnected>
        {locked === undefined ? (
          <Unencrypted />
        ) : locked ? (
          <Login />
        ) : (
          <Encrypted />
        )}
      </RequireCoreConnected>
    );
  }
}
export default SettingsSecurity;
