import { useEffect } from 'react';
import { createStore, Provider, useAtomValue } from 'jotai';
import { DevTools } from 'jotai-devtools';
import { jotaiDevToolsOpenAtom } from 'lib/ui';
import jotaiDevToolsStyles from 'jotai-devtools/styles.css';

const isDev = process.env.NODE_ENV === 'development';

export const jotaiStore = createStore();

export function JotaiWrapper({ children }) {
  return (
    <Provider store={jotaiStore}>
      <JotaiDevTools />
      {children}
    </Provider>
  );
}

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
  return isDev && open ? <DevTools store={jotaiStore} /> : null;
}
