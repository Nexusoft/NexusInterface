import { coreInfoQuery } from 'lib/coreInfo';
import { activeSessionIdAtom } from 'lib/session';
import { store } from 'lib/store';

/**
 * Send a Tritium API request in GET method
 */
export async function callAPIByUrl(url: string) {
  return window.nexusElectron.coreRpc.callByUrl(url);
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
  pooled?: boolean;
  requested?: number;
  expires?: number;
  onhold?: boolean;
  holdtime?: number;
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

export type ContractOP =
  | 'WRITE'
  | 'APPEND'
  | 'CREATE'
  | 'TRANSFER'
  | 'CLAIM'
  | 'COINBASE'
  | 'TRUST'
  | 'TRUSTPOOL'
  | 'GENESIS'
  | 'GENESISPOOL'
  | 'DEBIT'
  | 'CREDIT'
  | 'MIGRATE'
  | 'AUTHORIZE'
  | 'FEE'
  | 'LEGACY';

export type FromOrTo = {
  address: string;
  name: string;
  local: boolean;
  mine: boolean;
  type: string;
  namespace?: string;
};

export interface Contract {
  id: number;
  OP: ContractOP;
  for: string;
  txid: string;
  contract: number;
  from: FromOrTo;
  to: FromOrTo;
  amount: number;
  token: string;
  ticker?: string;
  trustkey?: string;
  name?: string;
  address?: string;
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
  unclaimed?: number;
  unconfirmed?: number;
  stake?: number;
  immature?: number;
  data?: string;
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
  unclaimed?: number;
  unconfirmed?: number;
}

export interface NameRecord extends NxsObject {
  register: string;
  name: string;
  local: boolean;
  namespace?: string;
  mine: boolean;
  user?: string;
  global?: boolean;
}

export interface NameEvent extends NxsObject {
  register: string;
  name: string;
  local: boolean;
  mine: boolean;
  action: string;
  checksum?: string;
  namespace?: string;
}

export interface Namespace extends NxsObject {
  namespace: string;
}

export interface NamespaceEvent extends NxsObject {
  register: string;
  name: string;
  local: boolean;
  mine: boolean;
  action: string;
  checksum?: string;
}

export interface Asset extends NxsObject {
  name?: string;
  data: any;
  [key: string]: any;
}

export interface AssetSchemaItem {
  name: string;
  type: string;
  value: any;
  mutable: boolean;
  maxlength?: number;
}

export interface AssetHistoryEvent extends NxsObject {
  address: string;
  name: string;
  action: 'CREATE' | 'MODIFY' | 'TRANSFER' | 'CLAIM';
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
async function callAPI<TParams extends { address: string }>(
  endpoint: 'system/validate/address',
  customParams: TParams
): Promise<{
  address: string;
  valid: boolean;
  type: boolean;
  mine: boolean;
  standard: string;
}>;

async function callAPI(endpoint: 'ledger/get/info'): Promise<LedgerInfo>;
async function callAPI<
  TParams extends {
    txid: string;
    verbose?: string;
  }
>(
  endpoint: 'ledger/get/transaction',
  customParams: TParams
): Promise<Transaction>;

async function callAPI<TParams extends { session?: string }>(
  endpoint: 'sessions/status/local',
  customParams?: TParams
): Promise<UserStatus>;
async function callAPI<
  TParams extends {
    username: string;
    password: string;
    pin: string;
  }
>(
  endpoint: 'sessions/create/local',
  customParams: TParams
): Promise<{
  genesis: string;
  session: string;
}>;
async function callAPI<TParams extends { session?: string }>(
  endpoint: 'sessions/terminate/local',
  customParams?: TParams
): Promise<void>;
async function callAPI(endpoint: 'sessions/list/local'): Promise<Session[]>;
async function callAPI<
  TParams extends {
    pin: string;
    notifications?: boolean;
    staking?: boolean;
    mining?: boolean;
    session?: string;
  }
>(
  endpoint: 'sessions/unlock/local',
  customParams: TParams
): Promise<{
  unlocked: {
    mining: boolean;
    notifications: boolean;
    staking: boolean;
    transactions: boolean;
  };
}>;

async function callAPI<
  TParams extends {
    username?: string;
    genesis?: string;
  }
>(
  endpoint: 'profiles/status/master',
  customParams?: TParams
): Promise<ProfileStatus>;
async function callAPI<
  TParams extends QueryParams & {
    verbose?: string;
  }
>(
  endpoint: 'profiles/transactions/master',
  customParams?: TParams
): Promise<Transaction[]>;
async function callAPI<
  TParams extends {
    password: string;
    pin: string;
    new_password: string;
    new_pin: string;
  }
>(
  endpoint: 'profiles/update/credentials',
  customParams: TParams
): Promise<OperationResult>;
async function callAPI<
  TParams extends {
    username: string;
    password: string;
    pin: string;
  }
>(
  endpoint: 'profiles/create/auth',
  customParams: TParams
): Promise<OperationResult>;
async function callAPI<
  TParams extends {
    username: string;
    password: string;
    pin: string;
  }
>(
  endpoint: 'profiles/create/master',
  customParams: TParams
): Promise<{ success: boolean; txid?: string }>;
async function callAPI<
  TParams extends {
    username: string;
    password: string;
    pin: string;
    recovery: string;
  }
>(
  endpoint: 'profiles/recover/master',
  customParams: TParams
): Promise<OperationResult>;
async function callAPI<
  TParams extends {
    password: string;
    pin: string;
    recovery: string;
    new_recovery: string;
  }
>(
  endpoint: 'profiles/update/recovery',
  customParams: TParams
): Promise<OperationResult>;

async function callAPI<
  TParams extends {
    pin: string;
    from: string;
    recipients: {
      address_to: string;
      amount: number;
    };
    reference?: number;
    expires?: number;
  }
>(
  endpoint: 'finance/debit/any',
  customParams: TParams
): Promise<OperationResult>;
async function callAPI<
  TParams extends {
    pin: string;
    from: string;
    recipients: {
      address_to: string;
      amount: number;
    };
    reference?: number;
    expires?: number;
  }
>(
  endpoint: 'finance/debit/token',
  customParams: TParams
): Promise<OperationResult>;
async function callAPI<
  TParams extends {
    name?: string;
    address?: string;
  }
>(endpoint: 'finance/get/any', customParams: TParams): Promise<Account>;
async function callAPI<
  TParams extends {
    name?: string;
    address?: string;
  }
>(endpoint: 'finance/get/token', customParams: TParams): Promise<Token>;
async function callAPI<
  TParams extends QueryParams & {
    verbose?: string;
    name?: string;
    address?: string;
  }
>(
  endpoint: 'finance/transactions/any',
  customParams?: TParams
): Promise<Transaction[]>;
async function callAPI<
  TParams extends {
    pin: string;
    amount: number;
  }
>(
  endpoint: 'finance/set/stake',
  customParams: TParams
): Promise<OperationResult>;
async function callAPI<
  TParams extends {
    pin: string;
    name?: string;
  }
>(
  endpoint: 'finance/create/account',
  customParams: TParams
): Promise<OperationResultWithAddress>;
async function callAPI<
  TParams extends {
    pin: string;
    name?: string;
    data?: any;
    suppply: number;
    decimals: number;
  }
>(
  endpoint: 'finance/create/token',
  customParams: TParams
): Promise<OperationResultWithAddress>;
async function callAPI(endpoint: 'finance/get/stakeinfo'): Promise<StakeInfo>;
async function callAPI(
  endpoint: 'finance/get/balances'
): Promise<Array<NexusBalance | TokenBalance>>;
async function callAPI<TParams extends QueryParams>(
  endpoint: 'finance/list/tokens',
  customParams?: TParams
): Promise<Token[]>;
async function callAPI<TParams extends QueryParams>(
  endpoint: 'finance/list/any',
  customParams?: TParams
): Promise<Account[]>;

async function callAPI<
  TParams extends {
    name?: string;
    address?: string;
  }
>(endpoint: 'names/get/name', customParams?: TParams): Promise<NameRecord>;
async function callAPI<
  TParams extends {
    name?: string;
    address?: string;
  }
>(endpoint: 'names/get/inactive', customParams?: TParams): Promise<NameRecord>;
async function callAPI<
  TParams extends {
    address: string;
  }
>(
  endpoint: 'names/reverse/lookup',
  customParams?: TParams
): Promise<NameRecord>;
async function callAPI<
  TParams extends {
    address: string;
  }
>(endpoint: 'names/history/name', customParams?: TParams): Promise<NameEvent[]>;
async function callAPI<
  TParams extends {
    address: string;
  }
>(
  endpoint: 'names/history/namespace',
  customParams?: TParams
): Promise<NamespaceEvent[]>;
// TODO: double check if these params are correct
async function callAPI<
  TParams extends {
    address?: string;
    name?: string;
    pin: string;
    username?: string;
    destination?: string;
  }
>(
  endpoint: 'names/transfer/name',
  customParams?: TParams
): Promise<OperationResultWithAddress>;
// TODO: double check if these params are correct
async function callAPI<
  TParams extends {
    address?: string;
    namespace?: string;
    pin: string;
    username?: string;
    destination?: string;
  }
>(
  endpoint: 'names/transfer/namespace',
  customParams?: TParams
): Promise<OperationResultWithAddress>;

async function callAPI<
  TParams extends {
    address: string;
  }
>(
  endpoint: 'assets/get/schema',
  customParams?: TParams
): Promise<AssetSchemaItem[]>;
async function callAPI<
  TParams extends {
    address: string;
  }
>(
  endpoint: 'assets/history/asset',
  customParams?: TParams
): Promise<AssetHistoryEvent[]>;

async function callAPI(
  endpoint: string,
  customParams?: Record<string, any>
): Promise<unknown>;

/**
 * callAPI Implementation
 * Send a Tritium API request in POST method
 */
async function callAPI(endpoint: string, customParams?: Record<string, any>) {
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
  return window.nexusElectron.coreRpc.call({ endpoint, params });
}
export { callAPI };

/**
 * =============================================================================
 * ListAll overloads
 * =============================================================================
 */

async function listAll<
  TParams extends QueryParams & {
    verbose?: string;
    name?: string;
    address?: string;
  }
>(
  endpoint: 'finance/transactions/any',
  customParams?: TParams
): Promise<Transaction[]>;
async function listAll<TParams extends QueryParams>(
  endpoint: 'finance/list/tokens',
  customParams?: TParams
): Promise<Token[]>;
async function listAll<TParams extends QueryParams>(
  endpoint: 'names/list/names',
  customParams?: TParams
): Promise<NameRecord[]>;
async function listAll<TParams extends QueryParams>(
  endpoint: 'names/list/inactive',
  customParams?: TParams
): Promise<NameRecord[]>;
async function listAll<TParams extends QueryParams>(
  endpoint: 'names/list/namespaces',
  customParams?: TParams
): Promise<Namespace[]>;

async function listAll<TParams extends QueryParams>(
  endpoint: 'assets/list/assets',
  customParams?: TParams
): Promise<Asset[]>;
async function listAll<TParams extends QueryParams>(
  endpoint: 'assets/list/partial',
  customParams?: TParams
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
