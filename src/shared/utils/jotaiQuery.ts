import { useEffect } from 'react';
import { useAtomValue, atom, Getter, Atom } from 'jotai';
import { atomWithQuery, AtomWithQueryOptions } from 'jotai-tanstack-query';
import { store } from 'lib/store';

interface JotaiQueryOptions<TQueryFnData, TData = TQueryFnData> {
  condition?: (get: Getter) => boolean;
  getQueryConfig: (
    get: Getter
  ) => Omit<AtomWithQueryOptions<TQueryFnData>, 'enabled'>;
  selectValue?: (value: TQueryFnData | undefined) => TData | undefined;
  refetchTriggers?: Atom<any>[];
  alwaysOn?: boolean;
}

export default function jotaiQuery<TQueryFnData, TData = TQueryFnData>({
  condition,
  getQueryConfig,
  selectValue,
  refetchTriggers,
  alwaysOn = false,
}: JotaiQueryOptions<TQueryFnData, TData>) {
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

  const valueAtom = atom((get) => {
    const enabled = get(enabledAtom);
    const query = get(queryAtom);
    let value: TQueryFnData | undefined;
    if (!enabled || !query || query.isError) {
      value = undefined;
    } else {
      value = query.data;
    }
    return selectValue ? selectValue(value) : value;
  });

  const refetch = () => {
    const enabled = store.get(enabledAtom);
    if (enabled) {
      return Promise.resolve(store.get(queryAtom)?.refetch?.());
    } else {
      return Promise.resolve(null);
    }
  };

  const use = () => {
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

  return {
    use,
    queryAtom,
    valueAtom,
    refetch,
  };
}
