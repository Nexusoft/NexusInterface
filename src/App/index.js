// External
import { hot } from 'react-hot-loader/root';
import React, { Component } from 'react';
import { ConnectedRouter } from 'connected-react-router';
import { Route, Switch } from 'react-router';
import styled from '@emotion/styled';

// Internal
import GlobalStyles from 'components/GlobalStyles';
import Overlays from './Overlays';
import Overview from './Overview';
import Header from './Header';
import Navigation from './Navigation';
import Send from './Send';
import Transactions from './Transactions';
import Market from './Market';
import AddressBook from './AddressBook';
import Settings from './Settings';
import Terminal from './Terminal';

import About from './About';
import Modules from './Modules';
// import Exchange from './Exchange';
// import TrustList from './TrustList';
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

const App = ({ history }) => (
  <ThemeController>
    <ConnectedRouter history={history}>
      <Overlays>
        <GlobalStyles />
        <AppBackground />
        <AppLayout>
          <Header />
          <Main>
            <Switch>
              <Route exact path="/" component={Overview} />
              <Route exact path="/Send" component={Send} />
              <Route exact path="/Transactions" component={Transactions} />
              <Route exact path="/Market" component={Market} />
              <Route exact path="/AddressBook" component={AddressBook} />
              <Route path="/Settings" component={Settings} />
              <Route path="/Terminal" component={Terminal} />

              {/* <Route path="/Exchange" component={Exchange} /> */}
              {/* <Route exact path="/List" component={TrustList} /> */}

              <Route exact path="/About" component={About} />
              <Route path="/Modules/:name" component={Modules} />
            </Switch>
          </Main>
          <Navigation />
        </AppLayout>
      </Overlays>
    </ConnectedRouter>
  </ThemeController>
);

export default hot(App);
