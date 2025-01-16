import { combineReducers } from 'redux';

import ui from './ui';
import modules from './modules';
import moduleStates from './moduleStates';
import updater from './updater';
import activeAppModuleName from './activeAppModuleName';
import failedModules from './failedModules';
import assetSchemas from './assetSchemas';
import moduleDownloads from './moduleDownloads';
import featuredModules from './featuredModules';

export default function createRootReducer() {
  return combineReducers({
    ui,
    modules,
    moduleStates,
    failedModules,
    updater,
    activeAppModuleName,
    assetSchemas,
    moduleDownloads,
    featuredModules,
  });
}
