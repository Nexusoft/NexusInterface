import { combineReducers } from 'redux';

import common from './common';
import addressBook from './addressBook';
import settings from './settings';
import theme from './theme';
import ui from './ui';
import modules from './modules';
import moduleStates from './moduleStates';
import core from './core';
import user from './user';
import updater from './updater';
import activeAppModuleName from './activeAppModuleName';
import bootstrap from './bootstrap';
import failedModules from './failedModules';
import assetSchemas from './assetSchemas';
import moduleDownloads from './moduleDownloads';
import featuredModules from './featuredModules';

export default function createRootReducer() {
  return combineReducers({
    core,
    user,
    common,
    addressBook,
    settings,
    theme,
    ui,
    modules,
    moduleStates,
    failedModules,
    updater,
    activeAppModuleName,
    bootstrap,
    assetSchemas,
    moduleDownloads,
    featuredModules,
  });
}
