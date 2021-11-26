import Form from 'components/Form';
import SettingsField from 'components/SettingsField';
import { legacyMode } from 'consts/misc';
import { required } from 'lib/form';

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
        size="12"
        validate={required()}
      />

      {!legacyMode && (
        <>
          <Setting
            label={__('API SSL')}
            subLabel={__('Use SSL for API calls')}
            component={Form.Switch}
            name="manualDaemonApiSSL"
          />

          <Setting
            label={__('API non-SSL Port')}
            subLabel={__('Nexus API server non-SSL Port')}
            component={Form.TextField}
            name="manualDaemonApiPort"
            size="5"
            validate={required()}
          />

          <Setting
            label={__('API SSL Port')}
            subLabel={__('Nexus API server SSL Port')}
            component={Form.TextField}
            name="manualDaemonApiPortSSL"
            size="5"
            validate={required()}
          />

          <Setting
            label={__('API Username')}
            subLabel={__('Nexus API server Username')}
            component={Form.TextField}
            name="manualDaemonApiUser"
            size="12"
            validate={required()}
          />

          <Setting
            label={__('API Password')}
            subLabel={__('Nexus API server Password')}
            component={Form.TextField}
            name="manualDaemonApiPassword"
            size="12"
            validate={required()}
          />
        </>
      )}

      <Setting
        label={__('RPC SSL')}
        subLabel={__('Use SSL for RPC calls')}
        component={Form.Switch}
        name="manualDaemonSSL"
      />

      <Setting
        label={__('RPC non-SSL Port')}
        subLabel={__('Nexus RPC server non-SSL Port')}
        component={Form.TextField}
        name="manualDaemonPort"
        size="5"
        validate={required()}
      />

      <Setting
        label={__('RPC SSL Port')}
        subLabel={__('Nexus RPC server SSL Port')}
        component={Form.TextField}
        name="manualDaemonPortSSL"
        size="5"
        validate={required()}
      />

      <Setting
        label={__('RPC Username')}
        subLabel={__('Nexus RPC server Username')}
        component={Form.TextField}
        name="manualDaemonUser"
        size="12"
        validate={required()}
      />

      <Setting
        label={__('RPC Password')}
        subLabel={__('Nexus RPC server Password')}
        component={Form.TextField}
        name="manualDaemonPassword"
        size="12"
        validate={required()}
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
