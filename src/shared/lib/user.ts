import jotaiQuery from 'utils/jotaiQuery';
import { callAPI, listAll } from 'lib/api';
import { loggedInAtom, userGenesisAtom, txCountAtom } from 'lib/session';
import {
  NexusBalance,
  TokenBalance,
  Token,
  Account,
  NameRecord,
  Namespace,
  Asset,
  PartialAsset,
} from 'lib/api';

export const balancesQuery = jotaiQuery<
  Array<NexusBalance | TokenBalance>,
  [NexusBalance, TokenBalance[]] | readonly [undefined, undefined]
>({
  condition: (get) => get(loggedInAtom),
  getQueryConfig: (get) => ({
    queryKey: ['balances', get(userGenesisAtom)],
    queryFn: () => callAPI('finance/get/balances'),
    staleTime: 300000, // 5 minutes
    refetchOnMount: 'always',
  }),
  selectValue: (balances) => {
    if (!balances) return [undefined, undefined] as const;
    const nxsIndex = balances.findIndex(({ token }) => token === '0');
    const tokenBalances = [...balances];
    const [nxsBalances] =
      nxsIndex >= 0 ? tokenBalances.splice(nxsIndex, 1) : [undefined];
    return [nxsBalances, tokenBalances] as [NexusBalance, TokenBalance[]];
  },
  refetchTriggers: [txCountAtom],
});

export const tokensQuery = jotaiQuery<Token[]>({
  condition: (get) => get(loggedInAtom),
  getQueryConfig: (get) => ({
    queryKey: ['tokens', get(userGenesisAtom)],
    queryFn: () => listAll('finance/list/tokens'),
    staleTime: 300000, // 5 minutes
    refetchOnMount: 'always',
  }),
  refetchTriggers: [txCountAtom],
});

export const accountsQuery = jotaiQuery<Account[]>({
  condition: (get) => get(loggedInAtom),
  getQueryConfig: (get) => ({
    queryKey: ['accounts', get(userGenesisAtom)],
    queryFn: () => callAPI('finance/list/any'),
    staleTime: 300000, // 5 minutes
    refetchOnMount: 'always',
  }),
  refetchTriggers: [txCountAtom],
});

export const nameRecordsQuery = jotaiQuery<NameRecord[]>({
  condition: (get) => get(loggedInAtom),
  getQueryConfig: (get) => ({
    queryKey: ['nameRecords', get(userGenesisAtom)],
    queryFn: async () => {
      const nameRecords = await listAll('names/list/names');
      const unusedRecords = await listAll('names/list/inactive');
      return [...nameRecords, ...unusedRecords];
    },
    staleTime: 300000, // 5 minutes
    refetchOnMount: 'always',
  }),
  refetchTriggers: [txCountAtom],
});

export const namespacesQuery = jotaiQuery<Namespace[]>({
  condition: (get) => get(loggedInAtom),
  getQueryConfig: (get) => ({
    queryKey: ['namespacesQuery', get(userGenesisAtom)],
    queryFn: () => listAll('names/list/namespaces'),
    staleTime: 300000, // 5 minutes
    refetchOnMount: 'always',
  }),
  refetchTriggers: [txCountAtom],
});

export const assetsQuery = jotaiQuery<(Asset | PartialAsset)[]>({
  condition: (get) => get(loggedInAtom),
  getQueryConfig: (get) => ({
    queryKey: ['assets', get(userGenesisAtom)],
    queryFn: async () => {
      let [assets] = await Promise.all([listAll('assets/list/assets')]);
      //TODO: Partial returns an error instead of a empty array if there are no assets found which is not the best way to do that, consider revising
      try {
        const partialAssets = await listAll('assets/list/partial');
        return [...assets, ...partialAssets];
      } catch (error: any) {
        // Reason?
        if (error?.code !== -74) {
          throw error;
        }
      }
      return assets;
    },
    staleTime: 300000, // 5 minutes
    refetchOnMount: 'always',
  }),
  refetchTriggers: [txCountAtom],
});
