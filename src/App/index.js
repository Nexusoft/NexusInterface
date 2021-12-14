// External
import { Switch, Redirect } from 'react-router';
import { Router, Route } from 'react-router-dom';
import styled from '@emotion/styled';
import { useSelector } from 'react-redux';

// Internal
import GlobalStyles from 'components/GlobalStyles';
import ThemeController from 'components/ThemeController';
import { legacyMode } from 'consts/misc';
import { history } from 'lib/wallet';
import { showDefaultMenu } from 'lib/contextMenu';

import Overlays from './Overlays';
import Overview from './Overview';
import OverviewTritium from './OverviewTritium';
import Header from './Header';
import Navigation from './Navigation';
import Send from './Send';
import SendTritium from './SendTritium';
import Transactions from './Transactions';
import TransactionsTritium from './TransactionsTritium';
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

export default function App() {
  const theme = useSelector((state) => state.theme);
  return (
    <Router history={history}>
      <ThemeController theme={theme}>
        <GlobalStyles />
        <div onContextMenu={showDefaultMenu}>
          <Overlays>
            <AppBackground />
            <AppLayout>
              <Header />
              <Main>
                <Switch>
                  <Route exact path="/">
                    {legacyMode ? <Overview /> : <OverviewTritium />}
                  </Route>
                  <Route exact path="/Send">
                    {legacyMode ? <Send /> : <SendTritium />}
                  </Route>
                  <Route exact path="/Transactions">
                    {legacyMode ? <Transactions /> : <TransactionsTritium />}
                  </Route>
                  <Route exact path="/AddressBook">
                    <AddressBook />
                  </Route>
                  <Route path="/Settings">
                    <Settings />
                  </Route>
                  <Route path="/Terminal">
                    <Terminal />
                  </Route>
                  {!legacyMode && (
                    <Route path="/User">
                      <UserPage />
                    </Route>
                  )}
                  <Route path="/Modules/:name">
                    <Modules />
                  </Route>
                  <Route render={() => <Redirect to="/" />} />
                </Switch>
              </Main>
              <Navigation />
            </AppLayout>
          </Overlays>
        </div>
      </ThemeController>
    </Router>
  );
}
