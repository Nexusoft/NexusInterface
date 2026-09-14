import { useEffect } from 'react';
import { useAtomValue, atom, Getter, Atom, WritableAtom } from 'jotai';
import {
  atomWithQuery,
  AtomWithQueryOptions,
  AtomWithQueryResult,
} from 'jotai-tanstack-query';
import { store } from 'lib/store';

export interface JotaiQueryOptions<TQueryFnData> {
  condition?: (get: Getter) => boolean;
  getQueryConfig: (
    get: Getter
  ) => Omit<AtomWithQueryOptions<TQueryFnData>, 'enabled'>;
  refetchTriggers?: Atom<any>[];
  alwaysOn?: boolean;
}

export interface JotaiQueryWithSelectOptions<TQueryFnData, TData>
  extends JotaiQueryOptions<TQueryFnData> {
  selectValue: (value: TQueryFnData | undefined) => TData;
}

export interface JotaiQueryObject<TQueryFnData> {
  use: () => TQueryFnData | undefined;
  queryAtom: WritableAtom<AtomWithQueryResult<TQueryFnData>, [], void>;
  valueAtom: Atom<TQueryFnData | undefined>;
  refetch: () => Promise<void>;
}

export interface JotaiQueryWithSelectObject<TQueryFnData, TData> {
  use: () => TData | undefined;
  queryAtom: WritableAtom<AtomWithQueryResult<TQueryFnData>, [], void>;
  valueAtom: Atom<TData | undefined>;
  refetch: () => Promise<void>;
}

export default function jotaiQuery<TQueryFnData>(
  options: JotaiQueryOptions<TQueryFnData>
): JotaiQueryObject<TQueryFnData>;
export default function jotaiQuery<TQueryFnData, TData = TQueryFnData>(
  options: JotaiQueryWithSelectOptions<TQueryFnData, TData>
): JotaiQueryWithSelectObject<TQueryFnData, TData>;
export default function jotaiQuery<TQueryFnData, TData = TQueryFnData>(
  options:
    | JotaiQueryOptions<TQueryFnData>
    | JotaiQueryWithSelectOptions<TQueryFnData, TData>
) {
  const {
    condition,
    getQueryConfig,
    refetchTriggers,
    alwaysOn = false,
  } = options;
  const symbols = new Set();
  const turnedOnAtom = atom(false);

  const enabledAtom = atom((get) => {
    const turnedOn = alwaysOn || get(turnedOnAtom);
    const conditionMet = !condition || condition(get);
    return turnedOn && conditionMet;
  });

  const queryAtom = atomWithQuery((get) => ({
    enabled: get(enabledAtom),
    ...getQueryConfig(get),
  }));

  const getValue = (get: Getter) => {
    const enabled = get(enabledAtom);
    const query = get(queryAtom);
    let value: TQueryFnData | undefined;
    if (!enabled || !query || query.isError) {
      value = undefined;
    } else {
      value = query.data;
    }
    return value;
  };

  const refetch = async () => {
    const enabled = store.get(enabledAtom);
    if (enabled) {
      const refetchFunc = store.get(queryAtom)?.refetch;
      if (refetchFunc) {
        await refetchFunc();
      }
    }
  };

  const createUse =
    <T>(valueAtom: Atom<T>) =>
    () => {
      useEffect(() => {
        if (alwaysOn) return;
        const unsubs: Array<() => void> = [];
        if (symbols.size === 0) {
          store.set(turnedOnAtom, true);
          refetchTriggers?.forEach((triggerAtom) => {
            unsubs.push(store.sub(triggerAtom, refetch));
          });
        }
        const symbol = Symbol();
        symbols.add(symbol);
        return () => {
          symbols.delete(symbol);
          if (symbols.size === 0) {
            store.set(turnedOnAtom, false);
            unsubs.forEach((unsub) => {
              unsub();
            });
          }
        };
      }, []);
      const value = useAtomValue(valueAtom);
      return value;
    };

  if (alwaysOn) {
    refetchTriggers?.forEach((triggerAtom) => {
      store.sub(triggerAtom, refetch);
    });
  }

  if ('selectValue' in options) {
    const valueAtom = atom((get) => options.selectValue(getValue(get)));
    const use = createUse(valueAtom);
    return {
      use,
      queryAtom,
      valueAtom,
      refetch,
    };
  } else {
    const valueAtom = atom(getValue);
    const use = createUse(valueAtom);
    return {
      use,
      queryAtom,
      valueAtom,
      refetch,
    };
  }
}
