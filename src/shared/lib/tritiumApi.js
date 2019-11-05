import axios from 'axios';
import store from 'store';
import { remote } from 'electron';

import { customConfig, loadNexusConf } from 'lib/coreConfig';

const core = remote.getGlobal('core');

const getConfig = () => {
  const { settings } = store.getState();
  return settings.manualDaemon
    ? customConfig({
        ip: settings.manualDaemonIP,
        apiPort: settings.manualDaemonApiPort,
        apiUser: settings.manualDaemonApiUser,
        apiPassword: settings.manualDaemonApiPassword,
        dataDir: settings.manualDaemonDataDir,
      })
    : core.config || customConfig(loadNexusConf());
};

const getDefaultOptions = ({ apiUser, apiPassword }) => ({
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: !!(apiUser && apiPassword),
  auth:
    apiUser && apiPassword
      ? {
          username: apiUser,
          password: apiPassword,
        }
      : undefined,
});

/**
 * Send a Tritium API request in POST method
 *
 * @export
 * @param {*} endpoint
 * @param {*} params
 * @returns
 */
export async function apiPost(endpoint, params) {
  const conf = getConfig();
  try {
    const response = await axios.post(
      `${conf.apiHost}/${endpoint}`,
      params,
      getDefaultOptions(conf)
    );
    return response.data && response.data.result;
  } catch (err) {
    throw err.response && err.response.data && err.response.data.error;
  }
}

/**
 * Send a Tritium API request in GET method
 *
 * @export
 * @param {*} url
 * @returns
 */
export async function apiGet(url) {
  const conf = getConfig();
  try {
    const response = await axios.get(
      `${conf.apiHost}/${url}`,
      getDefaultOptions(conf)
    );
    return response.data && response.data.result;
  } catch (err) {
    throw err.response && err.response.data && err.response.data.error;
  }
}
