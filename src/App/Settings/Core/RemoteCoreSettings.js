import Form from 'components/Form';
import SettingsField from 'components/SettingsField';
import { defaultConfig } from 'lib/coreConfig';

__ = __context('Settings.Core');

function Setting({ label, subLabel, component: Component, ...rest }) {
  return (
    <SettingsField indent={1} connectLabel label={label} subLabel={subLabel}>
      <Component {...rest} />
    </SettingsField>
  );
}

export default function RemoteCoreSettings() {
  return (
    <>
      <Setting
        label={__('IP address')}
        subLabel={__('Remote Core IP address')}
        component={Form.TextField}
        name="manualDaemonIP"
        placeholder={defaultConfig.ip}
        size="12"
      />

      <Setting
        label={__('API SSL')}
        subLabel={__('Use SSL for API calls')}
        component={Form.Switch}
        name="manualDaemonApiSSL"
        placeholder={defaultConfig.apiSSL}
      />

      <Setting
        label={__('API non-SSL Port')}
        subLabel={__('Nexus API server non-SSL Port')}
        component={Form.TextField}
        name="manualDaemonApiPort"
        placeholder={defaultConfig.apiPort}
        size="5"
      />

      <Setting
        label={__('API SSL Port')}
        subLabel={__('Nexus API server SSL Port')}
        component={Form.TextField}
        name="manualDaemonApiPortSSL"
        placeholder={defaultConfig.apiPortSSL}
        size="5"
      />

      <Setting
        label={__('API Username')}
        subLabel={__('Nexus API server Username')}
        component={Form.TextField}
        name="manualDaemonApiUser"
        placeholder={defaultConfig.apiUser}
        size="12"
      />

      <Setting
        label={__('API Password')}
        subLabel={__('Nexus API server Password')}
        component={Form.TextField}
        name="manualDaemonApiPassword"
        placeholder={defaultConfig.apiPassword}
        size="12"
      />

      <Setting
        label={__('Log out on close')}
        subLabel={__('Log out of all users before closing the wallet')}
        component={Form.Switch}
        name="manualDaemonLogOutOnClose"
      />
    </>
  );
}
