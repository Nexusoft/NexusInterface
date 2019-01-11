// External
import React, { Component } from 'react';

// Internal
import SecuritySettingsLayout from 'components/SecuritySettingsLayout';
import ChangePassword from './ChangePassword';
import ImportPrivKey from './ImportPrivKey';
import ViewPrivKeyForAddress from './ViewPrivKeyForAddress';

class Encrypted extends Component {
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
