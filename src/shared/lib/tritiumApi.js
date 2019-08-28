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
    console.error(err);
    if (err.response) {
      const { status, data } = err.response;
      if (data.error) {
        const { code, message } = data.error;
        throw `${message}\nCode: ${code}`;
      }
    }
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
    console.error(err);
  }
}
