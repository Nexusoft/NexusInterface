// External
import React, { Component } from 'react';

// Internal
import SecuritySettingsLayout from 'components/SecuritySettingsLayout';
import EncryptWallet from './EncryptWallet';
import ImportPrivKey from './ImportPrivKey';
import ViewPrivKeyForAddress from './ViewPrivKeyForAddress';

/**
 * Unencrypter JSX
 *
 * @class Unencrypted
 * @extends {Component}
 */
class Unencrypted extends Component {
  /**
   * React Render
   *
   * @returns
   * @memberof Unencrypted
   */
  render() {
    return (
      <div>
        <SecuritySettingsLayout>
          <EncryptWallet />
          <ImportPrivKey />
        </SecuritySettingsLayout>
        <ViewPrivKeyForAddress />
      </div>
    );
  }
}
export default Unencrypted;
