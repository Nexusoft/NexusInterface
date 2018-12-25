// External Dependencies
import React, { Component } from 'react';
import { ConnectedRouter } from 'connected-react-router';
import { Route, Switch } from 'react-router';
import enLocaleData from 'react-intl/locale-data/en';
import { addLocaleData } from 'react-intl';
import localesReducer from 'reducers/intl';
import { connect, Provider } from 'react-redux';
import styled from '@emotion/styled';

// Internal Global Dependencies
import locale from 'reducers/intl';
import globalStyles from './styles/global';

// Internal Local Dependencies
import Loader from './Loader';
import Overview from './Overview';
import Header from './Header';
import Navigation from './Navigation';
import SendPage from './SendPage';
import Transactions from './Transactions';
import Market from './Market';
import AddressBook from './AddressBook';
import BlockExplorer from './BlockExplorer';
import Settings from './Settings';
import Terminal from './Terminal';
import StyleGuide from './StyleGuide';
import TrustList from './TrustList';
import About from './About';
import Exchange from './Exchange';
import App from './App';
import StarrySky from './StarrySky';

const Main = styled.main({
  gridArea: 'content',
  overflow: 'hidden',
  padding: '30px 10%',
  display: 'flex',
  alignItems: 'stretch',
});

const AppLoader = styled.div({
  position: 'fixed',
  top: '50%',
  left: '50%',
  width: 300,
  height: 300,
  transform: 'translate(-50%,-50%)',
});

export default class Root extends Component {
  render() {
    const { store, history } = this.props;
    return (
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <div>
            {globalStyles}
            <StarrySky />
            <AppLoader>
              <Loader />
            </AppLoader>
            <App>
              <Header />
              <Main>
                <Switch>
                  <Route exact path="/" component={Overview} />
                  <Route exact path="/SendPage" component={SendPage} />
                  <Route exact path="/Transactions" component={Transactions} />
                  <Route exact path="/Market" component={Market} />
                  <Route exact path="/AddressBook" component={AddressBook} />
                  <Route
                    exact
                    path="/BlockExplorer"
                    component={BlockExplorer}
                  />
                  <Route path="/Settings" component={Settings} />
                  <Route path="/Terminal" component={Terminal} />
                  <Route exact path="/StyleGuide" component={StyleGuide} />
                  <Route path="/Exchange" component={Exchange} />
                  <Route exact path="/List" component={TrustList} />
                  <Route exact path="/About" component={About} />
                </Switch>
              </Main>
              <Navigation />
            </App>
          </div>
        </ConnectedRouter>
      </Provider>
    );
  }
}
