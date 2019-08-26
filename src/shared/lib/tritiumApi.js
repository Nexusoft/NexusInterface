import axios from 'axios';
import store from 'store';

import { customConfig, loadNexusConf } from 'lib/coreConfig';

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
export function apiPost(endpoint, params) {
  const conf = getConfig();
  return axios.post(
    `${conf.apiHost}/${endpoint}`,
    params,
    getDefaultOptions(conf)
  );
}

/**
 * Send a Tritium API request in GET method
 *
 * @export
 * @param {*} url
 * @returns
 */
export function apiGet(url) {
  const conf = getConfig();
  return axios.get(`${conf.apiHost}/${url}`, getDefaultOptions(conf));
}
