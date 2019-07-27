// External
import React, { Component } from 'react';

// Internal
import SecuritySettingsLayout from './SecuritySettingsLayout';
import ChangePassword from './ChangePassword';
import ImportPrivKey from './ImportPrivKey';
import ViewPrivKeyForAddress from './ViewPrivKeyForAddress';

/**
 * If JSX is Encryped
 *
 * @class Encrypted
 * @extends {Component}
 */
class Encrypted extends Component {
  /**
   * Component's Renderable JSX
   *
   * @returns
   * @memberof Encrypted
   */
  render() {
    return (
      <div>
        <SecuritySettingsLayout>
          <ChangePassword />
          <ImportPrivKey />
        </SecuritySettingsLayout>
        <ViewPrivKeyForAddress />
      </div>
    );
  }
}
export default Encrypted;
