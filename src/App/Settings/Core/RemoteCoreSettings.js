import Form from 'components/Form';
import SettingsField from 'components/SettingsField';
import { legacyMode } from 'consts/misc';
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

      {!legacyMode && (
        <>
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
        </>
      )}

      <Setting
        label={__('RPC SSL')}
        subLabel={__('Use SSL for RPC calls')}
        component={Form.Switch}
        name="manualDaemonSSL"
        placeholder={defaultConfig.rpcSSL}
      />

      <Setting
        label={__('RPC non-SSL Port')}
        subLabel={__('Nexus RPC server non-SSL Port')}
        component={Form.TextField}
        name="manualDaemonPort"
        placeholder={defaultConfig.port}
        size="5"
      />

      <Setting
        label={__('RPC SSL Port')}
        subLabel={__('Nexus RPC server SSL Port')}
        component={Form.TextField}
        name="manualDaemonPortSSL"
        placeholder={defaultConfig.portSSL}
        size="5"
      />

      <Setting
        label={__('RPC Username')}
        subLabel={__('Nexus RPC server Username')}
        component={Form.TextField}
        name="manualDaemonUser"
        placeholder={defaultConfig.user}
        size="12"
      />

      <Setting
        label={__('RPC Password')}
        subLabel={__('Nexus RPC server Password')}
        component={Form.TextField}
        name="manualDaemonPassword"
        placeholder={defaultConfig.password}
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
