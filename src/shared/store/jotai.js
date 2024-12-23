import { useEffect } from 'react';
import {
  createStore,
  Provider as JotaiProvider,
  useAtomValue,
  useAtom,
} from 'jotai';
import { DevTools } from 'jotai-devtools';
import { useHydrateAtoms } from 'jotai/react/utils';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools';
import { queryClientAtom } from 'jotai-tanstack-query';
import { rqDevToolsOpenAtom, jotaiDevToolsOpenAtom } from 'lib/ui';
import jotaiDevToolsStyles from 'jotai-devtools/styles.css';

const isDev = process.env.NODE_ENV === 'development';

export const jotaiStore = createStore();

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
