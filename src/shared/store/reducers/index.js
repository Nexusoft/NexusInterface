import { combineReducers } from 'redux';
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
import user from './user';
import updater from './updater';
import activeAppModule from './activeAppModule';
import bootstrap from './bootstrap';
import failedModules from './failedModules';

export default function createRootReducer() {
  return combineReducers({
    core,
    user,
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
    failedModules,
    updater,
    activeAppModule,
    bootstrap,
    form: formReducer,
  });
}
