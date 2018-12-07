// External Dependencies
import React, { Component } from 'react';
// import { Provider } from "react-redux";
import { ConnectedRouter } from 'connected-react-router';
import { Route } from 'react-router';
// import { FormattedMessage, IntlProvider } from "react-intl-redux";
import enLocaleData from 'react-intl/locale-data/en';
import { addLocaleData } from 'react-intl';
//import { updateIntl } from "react-intl-redux";
import localesReducer from 'reducers/intl';
import { connect, Provider } from 'react-redux';

// Internal Global Dependencies
import settings from 'api/settings';
import locale from 'reducers/intl';

// Internal Local Dependencies
import Loader from './Loader';
import Overview from './Overview';
import Header from './Header';
import Footer from './Footer';
import SendRecieve from './SendRecieve';
import Transactions from './Transactions';
import Market from './Market';
import AddressBook from './AddressBook';
import BlockExplorer from './BlockExplorer';
import Settings from './Settings';
import Terminal from './Terminal';
import StyleGuide from './StyleGuide';
import List from './List';
import About from './About';
import Exchange from './Exchange';
import App from './App';
import StarrySky from './StarrySky';

export default class Root extends Component {
  render() {
    const { store, history } = this.props;
    return (
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <div>
            <StarrySky />
            <App>
              <Route path="/" component={Header} />
              <div id="app-content">
                <div id="app-content-container">
                  <div id="app-loader">
                    <Loader />
                  </div>
                  <Route exact path="/" component={Overview} />
                  <Route exact path="/SendRecieve" component={SendRecieve} />
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
                  <Route exact path="/List" component={List} />
                  <Route exact path="/About" component={About} />
                </div>
              </div>
              <div id="app-navigation">
                <Route path="/" component={Footer} />
              </div>
            </App>
          </div>
        </ConnectedRouter>
      </Provider>
    );
  }
}
