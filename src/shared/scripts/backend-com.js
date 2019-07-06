import * as RPC from './rpc';
import * as tritiumAPI from './tritium-api';

export const RunCommand = (protocol, command, params) => {
  if (protocol === 'RPC') return RPC.PROMISE(command, params);
  else return tritiumAPI.PROMISE(command, params);
};
