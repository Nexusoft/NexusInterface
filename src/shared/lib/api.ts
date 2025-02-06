import http from 'http';
import https, { RequestOptions } from 'https';

import { CoreConfig, getActiveCoreConfig } from 'lib/coreConfig';
import { coreInfoQuery } from 'lib/coreInfo';
import { activeSessionIdAtom } from 'lib/session';
import { store } from 'lib/store';

const getDefaultOptions = ({
  apiSSL,
  ip,
  apiPortSSL,
  apiPort,
  apiUser,
  apiPassword,
}: CoreConfig) => ({
  portocol: apiSSL ? 'https:' : 'http:',
  host: ip,
  port: apiSSL ? apiPortSSL : apiPort,
  headers: {
    'Content-Type': 'application/json',
  },
  auth: apiUser && apiPassword ? `${apiUser}:${apiPassword}` : undefined,
  rejectUnauthorized: false,
});

function sendRequest({
  params,
  options,
  ssl,
}: {
  params?: Object;
  options: RequestOptions;
  ssl?: boolean;
}) {
  return new Promise<any>((resolve, reject) => {
    try {
      const content = params && JSON.stringify(params);
      if (content) {
        options.headers = {
          ...options?.headers,
          'Content-Length': Buffer.byteLength(content),
        };
      }

      const { request } = ssl ? https : http;
      const req = request(options, (res) => {
        let data = '';
        res.setEncoding('utf8');

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          let result = undefined;
          if (data) {
            try {
              result = JSON.parse(data);
            } catch (err) {
              console.error('Response data is not valid JSON', data);
            }
          }
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve(result?.result);
          } else {
            reject(result?.error);
          }
        });

        res.on('aborted', () => {
          reject(new Error('Aborted'));
        });
      });

      req.on('error', (err) => {
        reject(err);
      });

      req.on('abort', () => {
        reject(new Error('Aborted'));
      });

      if (params) {
        req.write(content);
      }
      req.end();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Send a Tritium API request in GET method
 */
export async function callAPIByUrl(url: string) {
  const conf = await getActiveCoreConfig();
  return await sendRequest({
    options: {
      method: 'GET',
      path: `/${url}`,
      ...getDefaultOptions(conf),
    },
    ssl: conf.apiSSL,
  });
}

/**
 * =============================================================================
 * Types
 * =============================================================================
 */

export interface CoreInfo {
  version: string;
  protocolversion: number;
  timestamp: number;
  hostname: string;
  directory: string;
  address: string;
  private: boolean;
  hybrid: boolean;
  multiuser: boolean;
  litemode: boolean;
  nolegacy: boolean;
  blocks: number;
  synchronized: boolean;
  syncing:
    | false
    | {
        networkBlock: number;
        downloadRate: number;
        completed: number;
        progress: number;
        secondsRemaining: number;
        timeRemaining: string;
      };
  txtotal: number;
  connections: number;
  testnet?: number;
}

export interface PeerInfo {
  address: string;
  type: string;
  version: number;
  session: number;
  outgoing: false;
  height: number;
  best: string;
  latency: number;
  lastseen: number;
  connects: number;
  drops: number;
  fails: number;
  score: number;
}

export interface LedgerInfo {
  stake: {
    height: number;
    weight: string;
    timespan: number;
    fees: number;
    difficulty: number;
  };
  prime: {
    height: number;
    weight: string;
    timespan: number;
    fees: number;
    difficulty: number;
    reserve: number;
    reward: number;
    primes: number;
  };
  hash: {
    height: number;
    weight: string;
    timespan: number;
    fees: number;
    difficulty: number;
    reserve: number;
    reward: number;
    hashes: number;
  };
  supply: {
    total: number;
    target: number;
    inflation: number;
    minute: number;
    hour: number;
    day: number;
    week: number;
    month: number;
  };
  height: number;
  timestamp: number;
  checkpoint: string;
}

export interface UserStatus {
  genesis: string;
  accessed: number;
  duration: number;
  location: string;
  indexing: boolean;
  unlocked: {
    mining: boolean;
    notifications: boolean;
    staking: boolean;
    transactions: boolean;
  };
  saved: boolean;
}

export interface ProfileStatus {
  genesis: string;
  confirmed: boolean;
  recovery: boolean;
  crypto: boolean;
  transactions: number;
  session?: {
    username: string;
    accessed: number;
  };
}

export interface StakeInfo {
  address: string;
  balance: number;
  stake: number;
  trust: number;
  stakerate: number;
  trustweight: number;
  blockweight: number;
  stakeweight: number;
  new: boolean;
  staking: boolean;
  change: boolean;
}

export interface QueryParams {
  limit?: number;
  page?: number;
  offset?: number;
  sort?: string;
  order?: 'desc' | 'asc';
  where?: string;
}

export interface Session {
  username: string;
  genesis: string;
  session: string;
  accessed: number;
  duration: number;
}

export interface Contract {
  id: number;
  OP: string;
  for: string;
  txid: string;
  contract: number;
  from: {
    address: string;
    name: string;
    local: boolean;
    mine: boolean;
    type: string;
  };
  to: {
    address: string;
    name: string;
    local: boolean;
    mine: boolean;
    type: string;
  };
  amount: number;
  token: string;
  ticker?: string;
}

export interface Transaction {
  txid: string;
  type: string;
  version: number;
  sequence: number;
  timestamp: number;
  blockhash: string;
  confirmations: number;
  contracts: Contract[];
}

export interface NxsObject {
  owner: string;
  version: number;
  created: number;
  modified: number;
  type: string;
  address: string;
}

export interface Account extends NxsObject {
  balance: number;
  token: string;
  ticker?: string;
  name?: string;
}

export interface NexusBalance {
  available: number;
  confirmed: number;
  unclaimed: number;
  unconfirmed: number;
  decimals: number;
  token: '0';
  ticker: 'NXS';
  stake: number;
  immature: number;
}

export interface TokenBalance {
  available: number;
  confirmed: number;
  unclaimed: number;
  unconfirmed: number;
  decimals: number;
  token: string;
  ticker?: string;
}

export interface Token extends NxsObject {
  balance: number;
  decimals: number;
  currentsupply: number;
  maxsupply: number;
  token: string;
  ticker?: string;
}

export interface NameRecord extends NxsObject {
  register: string;
  name: string;
  local: boolean;
  namespace?: string;
  mine: boolean;
}

export interface NameEvent extends NxsObject {
  register: string;
  name: string;
  local: boolean;
  mine: boolean;
  action: string;
}

export interface Namespace extends NxsObject {
  namespace: string;
}

export interface Asset extends NxsObject {
  name?: string;
  data: any;
  [key: string]: any;
}

export interface PartialAsset extends Asset {
  ownership: number;
}

export type AssetFormat = 'readonly' | 'raw' | 'basic' | 'JSON';

export interface OperationSuccess {
  success: true;
  txid: string;
}

export interface OperationFail {
  success: false;
}

export type OperationResult = OperationSuccess | OperationFail;

export type OperationResultWithAddress =
  | (OperationSuccess & {
      address: string;
    })
  | OperationFail;

/**
 * =============================================================================
 * CallAPI overloads
 * =============================================================================
 */

async function callAPI(endpoint: 'system/get/info'): Promise<CoreInfo>;
async function callAPI(endpoint: 'system/stop'): Promise<void>;
async function callAPI(endpoint: 'system/list/peers'): Promise<Array<PeerInfo>>;
async function callAPI(
  endpoint: 'system/validate/address',
  customParams: { address: string }
): Promise<{
  address: string;
  valid: boolean;
  type: boolean;
  mine: boolean;
  standard: string;
}>;

async function callAPI(endpoint: 'ledger/get/info'): Promise<LedgerInfo>;
async function callAPI(
  endpoint: 'ledger/get/transaction',
  customParams: {
    txid: string;
    verbose?: 'summary';
  }
): Promise<Transaction>;

async function callAPI(endpoint: 'sessions/status/local'): Promise<UserStatus>;
async function callAPI(
  endpoint: 'sessions/create/local',
  customParams: {
    username: string;
    password: string;
    pin: string;
  }
): Promise<{
  genesis: string;
  session: string;
}>;
async function callAPI(
  endpoint: 'sessions/terminate/local',
  customParams?: {
    session?: string;
  }
): Promise<void>;
async function callAPI(endpoint: 'sessions/list/local'): Promise<Session[]>;
async function callAPI(
  endpoint: 'sessions/unlock/local',
  customParams: {
    pin: string;
    notifications?: boolean;
    staking?: boolean;
    mining?: boolean;
    session?: string;
  }
): Promise<{
  unlocked: {
    mining: boolean;
    notifications: boolean;
    staking: boolean;
    transactions: boolean;
  };
}>;

async function callAPI(
  endpoint: 'profiles/status/master',
  customParams?: {
    username?: string;
  }
): Promise<ProfileStatus>;
async function callAPI(
  endpoint: 'profiles/transactions/master',
  customParams?: QueryParams & {
    verbose?: 'summary';
  }
): Promise<Transaction[]>;
async function callAPI(
  endpoint: 'profiles/update/credentials',
  customParams: {
    password: string;
    pin: string;
    new_password: string;
    new_pin: string;
  }
): Promise<OperationResult>;
async function callAPI(
  endpoint: 'profiles/create/auth',
  customParams: {
    username: string;
    password: string;
    pin: string;
  }
): Promise<OperationResult>;
async function callAPI(
  endpoint: 'profiles/create/master',
  customParams: {
    username: string;
    password: string;
    pin: string;
  }
): Promise<{ success: boolean; txid?: string }>;
async function callAPI(
  endpoint: 'profiles/recover/master',
  customParams: {
    username: string;
    password: string;
    pin: string;
    recovery: string;
  }
): Promise<OperationResult>;
async function callAPI(
  endpoint: 'profiles/update/recovery',
  customParams: {
    password: string;
    pin: string;
    recovery: string;
    new_recovery: string;
  }
): Promise<OperationResult>;

async function callAPI(
  endpoint: 'finance/debit/any',
  customParams: {
    pin: string;
    from: string;
    recipients: {
      address_to: string;
      amount: number;
    };
    reference?: number;
    expires?: number;
  }
): Promise<OperationResult>;
async function callAPI(
  endpoint: 'finance/debit/token',
  customParams: {
    pin: string;
    from: string;
    recipients: {
      address_to: string;
      amount: number;
    };
    reference?: number;
    expires?: number;
  }
): Promise<OperationResult>;
async function callAPI(
  endpoint: 'finance/get/any',
  customParams: {
    name?: string;
    address?: string;
  }
): Promise<Account>;
async function callAPI(
  endpoint: 'finance/transactions/any',
  customParams?: QueryParams & {
    verbose?: 'summary';
    name?: string;
    address?: string;
  }
): Promise<Transaction[]>;
async function callAPI(
  endpoint: 'finance/set/stake',
  customParams: {
    pin: string;
    amount: number;
  }
): Promise<OperationResult>;
async function callAPI(
  endpoint: 'finance/create/account',
  customParams: {
    pin: string;
    name?: string;
  }
): Promise<OperationResultWithAddress>;
async function callAPI(endpoint: 'finance/get/stakeinfo'): Promise<StakeInfo>;
async function callAPI(
  endpoint: 'finance/get/balances'
): Promise<Array<NexusBalance | TokenBalance>>;
async function callAPI(
  endpoint: 'finance/list/tokens',
  customParams?: QueryParams
): Promise<Token[]>;
async function callAPI(
  endpoint: 'finance/list/any',
  customParams?: QueryParams
): Promise<Account[]>;

async function callAPI(
  endpoint: 'tokens/get/token',
  customParams: {
    name?: string;
    address?: string;
  }
): Promise<Token>;
async function callAPI(
  endpoint: 'tokens/create/token',
  customParams: {
    pin: string;
    supply: number;
    decimals: number;
    name?: string;
  }
): Promise<OperationResultWithAddress>;
async function callAPI(
  endpoint: 'tokens/create/account',
  customParams: {
    pin: string;
    token: string;
    name?: string;
  }
): Promise<OperationResultWithAddress>;

async function callAPI(
  endpoint: 'names/reverse/lookup',
  customParams: { address: string }
): Promise<NameRecord>;
async function callAPI(
  endpoint: 'names/get/name',
  customParams: QueryParams & {
    name?: string;
    address?: string;
  }
): Promise<NameRecord>;
async function callAPI(
  endpoint: 'names/get/inactive',
  customParams: QueryParams & {
    name?: string;
    address?: string;
  }
): Promise<NameRecord>;
async function callAPI(
  endpoint: 'names/rename/name',
  customParams: {
    pin: string;
    name?: string;
    address?: string;
    new: string;
  }
): Promise<OperationResult>;
async function callAPI(
  endpoint: 'names/create/name',
  customParams?: {
    pin: string;
    name: string;
    register: string;
  }
): Promise<OperationResultWithAddress>;
async function callAPI(
  endpoint: 'names/update/name',
  customParams?: {
    pin: string;
    name?: string;
    address?: string;
    register: string;
  }
): Promise<OperationResult>;
async function callAPI(
  endpoint: 'names/history/name',
  customParams?: {
    name?: string;
    address?: string;
  }
): Promise<NameEvent[]>;
async function callAPI(
  endpoint: 'names/transfer/name',
  customParams?: {
    pin: string;
    name?: string;
    address?: string;
    username?: string;
    destination?: string;
  }
): Promise<OperationResultWithAddress>;
async function callAPI(
  endpoint: 'names/create/namespace',
  customParams: {
    pin: string;
    namespace: string;
  }
): Promise<OperationResultWithAddress>;
async function callAPI(
  endpoint: 'names/history/namespace',
  customParams?: {
    name?: string;
    address?: string;
  }
): Promise<NameEvent[]>;
async function callAPI(
  endpoint: 'names/transfer/namespace',
  customParams?: {
    pin: string;
    name?: string;
    address?: string;
    username?: string;
    destination?: string;
  }
): Promise<OperationResultWithAddress>;
async function callAPI(
  endpoint: 'names/list/names',
  customParams?: QueryParams
): Promise<NameRecord[]>;
async function callAPI(
  endpoint: 'names/list/inactive',
  customParams?: QueryParams
): Promise<NameRecord[]>;
async function callAPI(
  endpoint: 'names/list/namespaces',
  customParams?: QueryParams
): Promise<Namespace[]>;

async function callAPI(
  endpoint: 'assets/get/schema',
  customParams: {
    name?: string;
    address?: string;
  }
): Promise<Asset>;
async function callAPI(
  endpoint: 'assets/history/asset',
  customParams?: {
    name?: string;
    address?: string;
  }
): Promise<NameEvent[]>;
async function callAPI(
  endpoint: 'assets/create/asset',
  customParams: {
    pin: string;
    format: AssetFormat;
    name?: string;
    json: Record<string, any>;
  }
): Promise<OperationResultWithAddress>;
async function callAPI(
  endpoint: 'assets/update/asset',
  customParams: {
    pin: string;
    name?: string;
    address?: string;
    [key: string]: any;
  }
): Promise<OperationResult>;
async function callAPI(
  endpoint: 'assets/tokenize/asset',
  customParams: {
    pin: string;
    name?: string;
    address?: string;
    token: string;
  }
): Promise<OperationResult>;
async function callAPI(
  endpoint: 'assets/transfer/asset',
  customParams?: {
    pin: string;
    name?: string;
    address?: string;
    username?: string;
    destination?: string;
  }
): Promise<OperationResultWithAddress>;
async function callAPI(
  endpoint: 'assets/list/assets',
  customParams?: QueryParams
): Promise<Asset[]>;
async function callAPI(
  endpoint: 'assets/list/partial',
  customParams?: QueryParams
): Promise<PartialAsset[]>;

async function callAPI(
  endpoint: string,
  customParams?: Record<string, any>
): Promise<any>;

/**
 * callAPI Implementation
 * Send a Tritium API request in POST method
 */
async function callAPI(endpoint: string, customParams?: Record<string, any>) {
  const conf = await getActiveCoreConfig();
  const sessionId = store.get(activeSessionIdAtom);
  const coreInfo = store.get(coreInfoQuery.valueAtom);

  //TODO: There is a bug in the core and where HAS to be the last param. Remove when fixed.
  if (customParams?.['where']) {
    const tempWhere = customParams['where'];
    delete customParams['where'];
    customParams['where'] = tempWhere;
  }

  const params = coreInfo?.multiuser
    ? { session: sessionId, ...customParams }
    : customParams;
  const options = {
    method: 'POST',
    path: `/${endpoint}`,
    ...getDefaultOptions(conf),
  };
  return await sendRequest({ params, options, ssl: conf.apiSSL });
}
export { callAPI };

/**
 * =============================================================================
 * ListAll overloads
 * =============================================================================
 */

async function listAll(
  endpoint: 'finance/transactions/any',
  customParams?: QueryParams & {
    verbose?: 'summary';
    name?: string;
    address?: string;
  }
): Promise<Transaction[]>;
async function listAll(
  endpoint: 'finance/list/tokens',
  customParams?: QueryParams
): Promise<Token[]>;
async function listAll(
  endpoint: 'names/list/names',
  customParams?: QueryParams
): Promise<NameRecord[]>;
async function listAll(
  endpoint: 'names/list/inactive',
  customParams?: QueryParams
): Promise<NameRecord[]>;
async function listAll(
  endpoint: 'names/list/namespaces',
  customParams?: QueryParams
): Promise<Namespace[]>;
async function listAll(
  endpoint: 'assets/list/assets',
  customParams?: QueryParams
): Promise<Asset[]>;
async function listAll(
  endpoint: 'assets/list/partial',
  customParams?: QueryParams
): Promise<PartialAsset[]>;

async function listAll(
  endpoint: string,
  customParams?: Record<string, any>
): Promise<any>;

async function listAll(endpoint: string, customParams?: Record<string, any>) {
  let list: any[] = [];
  let results = null;
  let page = 0;
  const limit = customParams?.['limit'] || 100;
  do {
    results = await callAPI(endpoint, {
      limit,
      ...customParams,
      page: page++,
    });
    if (!results) break;
    if (Array.isArray(results)) {
      list = list.concat(results);
    } else {
      throw new Error(
        `API result is expected to be an array, got ${typeof results}`
      );
    }
  } while (results.length === limit);
  return list;
}

export { listAll };
