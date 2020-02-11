// External
import { hot } from 'react-hot-loader/root';
import React from 'react';
import { Switch, Redirect } from 'react-router';
import { Router, Route } from 'react-router-dom';
import styled from '@emotion/styled';

// Internal
import GlobalStyles from 'components/GlobalStyles';
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
import Market from './Market';
import AddressBook from './AddressBook';
import Settings from './Settings';
import Terminal from './Terminal';
import UserPage from './UserPage';

import Modules from './Modules';
import AppBackground from './AppBackground';
import ThemeController from './ThemeController';

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

const App = () => (
  <Router history={history}>
    <ThemeController>
      <GlobalStyles />
      <div onContextMenu={showDefaultMenu}>
        <Overlays>
          <AppBackground />
          <AppLayout>
            <Header />
            <Main>
              <Switch>
                <Route
                  exact
                  path="/"
                  component={legacyMode ? Overview : OverviewTritium}
                />
                <Route
                  exact
                  path="/Send"
                  component={legacyMode ? Send : SendTritium}
                />
                <Route
                  exact
                  path="/Transactions"
                  component={legacyMode ? Transactions : TransactionsTritium}
                />
                <Route exact path="/Market" component={Market} />
                <Route exact path="/AddressBook" component={AddressBook} />
                <Route path="/Settings" component={Settings} />
                <Route path="/Terminal" component={Terminal} />
                {!legacyMode && <Route path="/User" component={UserPage} />}

                {/* <Route path="/Exchange" component={Exchange} /> */}
                {/* <Route exact path="/List" component={TrustList} /> */}
                <Route path="/Modules/:name" component={Modules} />

                <Redirect to="/" />
              </Switch>
            </Main>
            <Navigation />
          </AppLayout>
        </Overlays>
      </div>
    </ThemeController>
  </Router>
);

export default hot(App);
