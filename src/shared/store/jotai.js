import { useEffect } from 'react';
import {
  createStore,
  Provider as JotaiProvider,
  useAtomValue,
  useAtom,
  atom,
} from 'jotai';
import { atomWithQuery } from 'jotai-tanstack-query';
import { DevTools } from 'jotai-devtools';
import { useHydrateAtoms } from 'jotai/react/utils';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools';
import { queryClientAtom } from 'jotai-tanstack-query';
import { rqDevToolsOpenAtom, jotaiDevToolsOpenAtom } from 'lib/ui';
import jotaiDevToolsStyles from 'jotai-devtools/styles.css';

const isDev = process.env.NODE_ENV === 'development';

export const jotaiStore = createStore();

export function subscribe(atom, listener) {
  return jotaiStore.sub(atom, () => {
    const value = jotaiStore.get(atom);
    listener?.(value);
  });
}

export function subscribeWithPrevious(atom, listener) {
  let previousValue = jotaiStore.get(atom);
  return jotaiStore.sub(atom, () => {
    const value = jotaiStore.get(atom);
    listener?.(value, previousValue);
    previousValue = value;
  });
}

export const queryClient = new QueryClient();

function JotaiDevTools() {
  useEffect(() => {
    if (isDev) {
      const linkEl = document.createElement('link');
      linkEl.setAttribute('rel', 'stylesheet');
      linkEl.setAttribute('type', 'text/css');
      linkEl.setAttribute('href', jotaiDevToolsStyles);
      document.head.appendChild(linkEl);
    }
  }, []);

  const open = useAtomValue(jotaiDevToolsOpenAtom);
  return isDev && open && <DevTools store={jotaiStore} />;
}

function QueryDevTools() {
  const [rqDevToolsOpen, setRqDevToolsOpen] = useAtom(rqDevToolsOpenAtom);
  return (
    isDev &&
    rqDevToolsOpen && (
      <ReactQueryDevtoolsPanel onClose={() => setRqDevToolsOpen(false)} />
    )
  );
}

const HydrateAtoms = ({ children }) => {
  useHydrateAtoms([[queryClientAtom, queryClient]]);
  return children;
};

export function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <JotaiProvider store={jotaiStore}>
        <JotaiDevTools />
        <QueryDevTools />
        <HydrateAtoms>{children}</HydrateAtoms>
      </JotaiProvider>
    </QueryClientProvider>
  );
}

export function jotaiQuery({
  condition,
  getQueryConfig,
  selectValue,
  refetchTriggers,
}) {
  const symbols = new Set();
  const turnedOnAtom = atom(false);
  const queryAtom = atomWithQuery((get) => {
    const enabled = get(turnedOnAtom) && condition(get);
    return {
      enabled,
      ...getQueryConfig(get),
    };
  });
  const valueAtom = atom((get) => {
    const enabled = get(turnedOnAtom) && condition(get);
    const query = get(queryAtom);
    if (!enabled || !query || query.isError) {
      return null;
    } else {
      return query.data;
    }
  });
  const refetch = () => {
    jotaiStore.get(queryAtom)?.refetch?.();
  };

  return {
    use: () => {
      useEffect(() => {
        const unsubs = [];
        if (symbols.size === 0) {
          jotaiStore.set(turnedOnAtom, true);
          if (refetchTriggers?.length) {
            refetchTriggers.forEach((triggerAtom) => {
              unsubs.push(jotaiStore.sub(triggerAtom, refetch));
            });
          }
        }
        const symbol = Symbol();
        symbols.add(symbol);
        return () => {
          symbols.delete(symbol);
          if (symbols.size === 0) {
            jotaiStore.set(turnedOnAtom, false);
            if (unsubs.length) {
              unsubs.forEach((unsub) => {
                unsub();
              });
            }
          }
        };
      }, []);
      const value = useAtomValue(valueAtom);
      if (selectValue) {
        return selectValue(value);
      } else {
        return value;
      }
    },
    queryAtom,
    valueAtom,
    refetch,
  };
}
