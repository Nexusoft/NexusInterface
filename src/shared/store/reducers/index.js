import { combineReducers } from 'redux';

import addressBook from './addressBook';
import ui from './ui';
import modules from './modules';
import moduleStates from './moduleStates';
import updater from './updater';
import activeAppModuleName from './activeAppModuleName';
import bootstrap from './bootstrap';
import failedModules from './failedModules';
import assetSchemas from './assetSchemas';
import moduleDownloads from './moduleDownloads';
import featuredModules from './featuredModules';

export default function createRootReducer() {
  return combineReducers({
    addressBook,
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
