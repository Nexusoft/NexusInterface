// External
import { useEffect } from 'react';
import {
  Routes,
  Route,
  Navigate,
  HashRouter,
  useNavigate,
} from 'react-router-dom';
import styled from '@emotion/styled';
import { useSelector } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools';
import { useAtom } from 'jotai';

// Internal
import GlobalStyles from 'components/GlobalStyles';
import ThemeController from 'components/ThemeController';
import { showDefaultMenu } from 'lib/contextMenu';
import { setNavigate } from 'lib/wallet';
import { rqDevToolsOpenAtom } from 'lib/ui';
import { queryClient } from 'store';

import Overlays from './Overlays';
import Overview from './Overview';
import Header from './Header';
import Navigation from './Navigation';
import Send from './Send';
import Transactions from './Transactions';
import AddressBook from './AddressBook';
import Settings from './Settings';
import Terminal from './Terminal';
import UserPage from './UserPage';
import Modules from './Modules';
import AppBackground from './AppBackground';

const AppLayout = styled.div({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'grid',
  height: '100%',
  gridTemplateColumns: '1fr',
  gridTemplateRows: '74px auto 75px',
  gridTemplateAreas: '"header" "content" "navigation"',
});

const Main = styled.main({
  gridArea: 'content',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'stretch',
});

function NavigateExporter() {
  const navigate = useNavigate();
  useEffect(() => {
    setNavigate(navigate);
  }, [navigate]);
  return null;
}

export default function App() {
  const theme = useSelector((state) => state.theme);
  const [rqDevToolsOpen, setRqDevToolsOpen] = useAtom(rqDevToolsOpenAtom);
  return (
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <NavigateExporter />
        <ThemeController theme={theme}>
          <GlobalStyles />
          <div onContextMenu={showDefaultMenu}>
            <Overlays>
              <AppBackground />
              <AppLayout>
                <Header />
                <Main>
                  <Routes>
                    <Route index element={<Overview />} />
                    <Route path="Send" element={<Send />} />
                    <Route path="Transactions" element={<Transactions />} />
                    <Route path="AddressBook" element={<AddressBook />} />
                    <Route path="Settings/*" element={<Settings />} />
                    <Route path="Terminal/*" element={<Terminal />} />
                    <Route path="User/*" element={<UserPage />} />
                    <Route path="Modules/:name" element={<Modules />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Main>
                <Navigation />
              </AppLayout>
            </Overlays>
          </div>
        </ThemeController>
      </HashRouter>
      {rqDevToolsOpen && (
        <ReactQueryDevtoolsPanel onClose={() => setRqDevToolsOpen(false)} />
      )}
    </QueryClientProvider>
  );
}
