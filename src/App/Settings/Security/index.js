// External
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

// Internal
import RequireCoreConnected from 'components/RequireCoreConnected';
import { switchSettingsTab } from 'lib/ui';

import Login from './Login';
import Encrypted from './Encrypted';
import Unencrypted from './Unencrypted';

__ = __context('Settings.Security');

export default function SettingsSecurity() {
  const locked = useSelector((state) => state.core.info?.locked);
  useEffect(() => {
    switchSettingsTab('Security');
  }, []);

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
