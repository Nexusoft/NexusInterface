import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import { reducer as formReducer } from 'redux-form';

import list from './list';
import market from './market';
import transactions from './transactions';
import common from './common';
import exchange from './exchange';
import addressBook from './addressBook';
import myAccounts from './myAccounts';
import settings from './settings';
import theme from './theme';
import ui from './ui';
import modules from './modules';
import moduleStates from './moduleStates';
import core from './core';
import updater from './updater';
import webview from './webview';

export default function createRootReducer(history) {
  const routerReducer = connectRouter(history);

  return connectRouter(history)(
    combineReducers({
      core,
      list,
      market,
      transactions,
      exchange,
      common,
      addressBook,
      myAccounts,
      settings,
      theme,
      ui,
      modules,
      moduleStates,
      updater,
      webview,
      router: routerReducer,
      form: formReducer,
    })
  );
}
