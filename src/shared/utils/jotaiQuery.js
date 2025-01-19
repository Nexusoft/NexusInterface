import { useEffect } from 'react';
import { useAtomValue, atom } from 'jotai';
import { atomWithQuery } from 'jotai-tanstack-query';
import { store } from 'lib/store';

export default function jotaiQuery({
  condition,
  getQueryConfig,
  selectValue,
  refetchTriggers,
  alwaysOn = false,
}) {
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
    if (!enabled || !query || query.isError) {
      return null;
    } else {
      return query.data;
    }
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
      const unsubs = [];
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
    if (selectValue) {
      return selectValue(value);
    } else {
      return value;
    }
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
