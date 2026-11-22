// External
import { useEffect, useState } from 'react';
import {
  Routes,
  Route,
  Navigate,
  HashRouter,
  useNavigate,
} from 'react-router-dom';
import styled from '@emotion/styled';
import { useSelector } from 'react-redux';

// Internal
import GlobalStyles from 'components/GlobalStyles';
import ThemeController from 'components/ThemeController';
import { showDefaultMenu } from 'lib/contextMenu';
import { setNavigate } from 'lib/wallet';

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
import Wallets from './Wallets';
import Staking from './Staking';
import Registry from './Registry';
import Modules from './Modules';
import AppBackground from './AppBackground';
import themeStyles from 'utils/themeStyles';

const AppLayout = styled.div(themeStyles([{
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'grid',
  height: '100%',
  gridTemplateColumns: '1fr',
  gridTemplateRows: '74px auto 75px',
  gridTemplateAreas: '"header" "content" "navigation"'
}], [({
  expanded,
  autoHideNavigation
}) => ({
  '--header-height': 'clamp(64px, 9vh, 82px)',
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'grid',
  height: '100%',
  gridTemplateColumns: `${autoHideNavigation ? 0 : expanded ? 208 : 64}px minmax(0, 1fr)`,
  gridTemplateRows: 'var(--header-height) minmax(0, 1fr)',
  gridTemplateAreas: '"navigation header" "navigation content"',
  '@media (max-width: 600px)': {
    gridTemplateColumns: `${autoHideNavigation ? 0 : 56}px minmax(0, 1fr)`
  }
})]));

const Main = styled.main(themeStyles([{
  position: 'relative',
  isolation: 'isolate',
  gridArea: 'content',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'stretch'
}], [{
  position: 'relative',
  isolation: 'isolate',
  gridArea: 'content',
  minWidth: 0,
  minHeight: 0,
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'stretch'
}]));

function NavigateExporter() {
  const navigate = useNavigate();
  useEffect(() => {
    setNavigate(navigate);
  }, [navigate]);
  return null;
}

export default function App() {
  const [navigationExpanded, setNavigationExpanded] = useState(false);
  const theme = useSelector((state) => state.theme);
  const autoHideNavigation = useSelector((state) => !!state.settings.autoHideNavigation) && theme.modern;
  return (
    <HashRouter>
      <NavigateExporter />
      <ThemeController theme={theme}>
        <GlobalStyles />
        <div onContextMenu={showDefaultMenu}>
          <Overlays>
            <AppBackground />
            <AppLayout expanded={navigationExpanded} autoHideNavigation={autoHideNavigation}>
              <Header />
              <Main id="page-content">
                <Routes>
                  <Route index element={<Overview />} />
                  <Route path="Send" element={<Send />} />
                  <Route path="Transactions" element={<Transactions />} />
                  <Route path="AddressBook" element={<AddressBook />} />
                  <Route path="Settings/*" element={<Settings />} />
                  <Route path="Terminal/*" element={<Terminal />} />
                  <Route path="Wallets" element={<Wallets />} />
                  <Route path="User/Accounts" element={<Navigate to="/Wallets" replace />} />
                  <Route path="User/*" element={<UserPage />} />
                  <Route path="User/Staking" element={<Navigate to="/Staking" replace />} />
                  <Route path="Staking" element={<Staking />} />
                  <Route path="Registry/*" element={<Registry />} />
                  {['Tokens', 'Names', 'Namespaces', 'Assets'].map((section) => (
                    <Route key={section} path={`User/${section}`} element={<Navigate to={`/Registry/${section}`} replace />} />
                  ))}
                  <Route path="Modules/:name" element={<Modules />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Main>
              <Navigation expanded={navigationExpanded} autoHide={autoHideNavigation} onToggle={() => setNavigationExpanded((value) => !value)} />
            </AppLayout>
          </Overlays>
        </div>
      </ThemeController>
    </HashRouter>
  );
}
