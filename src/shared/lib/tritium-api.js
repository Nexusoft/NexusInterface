import axios from 'axios';
import store from 'store';

import { customConfig, loadNexusConf } from 'lib/coreConfig';

const port = '8080';

export const PROMISE = (api, verb, noun, args = {}) => {
  console.log('TRITIUM_API');
  console.log(`http://127.0.0.1:${port}/${api}/${verb}/${noun}`);
  console.log(args);

  //Move all this crap up or rework this
  const { settings } = store.getState();
  const conf = settings.manualDaemon
    ? customConfig({
        ip: settings.manualDaemonIP,
        port: settings.manualDaemonPort,
        user: settings.manualDaemonUser,
        password: settings.manualDaemonPassword,
        dataDir: settings.manualDaemonDataDir,
      })
    : core.config || customConfig(loadNexusConf());

  return  axios.post(
    `http://127.0.0.1:${port}/${api}/${verb}/${noun}`, {
      params: args,
    },
    {
      headers: {
        'Content-Type': 'application/json',
    },
      withCredentials: !!(conf.apiUser && conf.apiPassword),
      auth:
        conf.apiUser && conf.apiPassword
          ? {
              username: '',
              password: '',
            }
          : undefined,
    }
  );
};

export  const ExecuteURL = async (URL) => 
{
  //Move all this crap up or rework this
  const { settings } = store.getState();
  const conf = settings.manualDaemon
    ? customConfig({
        ip: settings.manualDaemonIP,
        port: settings.manualDaemonPort,
        user: settings.manualDaemonUser,
        password: settings.manualDaemonPassword,
        dataDir: settings.manualDaemonDataDir,
      })
    : core.config || customConfig(loadNexusConf());

    return await axios.post(
      `http://127.0.0.1:${port}/${URL}`, {
      },
      {
        headers: {
          'Content-Type': 'application/json',
      },
        withCredentials: !!(conf.apiUser && conf.apiPassword),
        auth:
          conf.apiUser && conf.apiPassword
            ? {
                username: '',
                password: '',
              }
            : undefined,
      }
    );
}
