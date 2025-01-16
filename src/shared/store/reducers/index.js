import { combineReducers } from 'redux';

import ui from './ui';
import modules from './modules';
import moduleStates from './moduleStates';
import activeAppModuleName from './activeAppModuleName';
import failedModules from './failedModules';
import moduleDownloads from './moduleDownloads';
import featuredModules from './featuredModules';

export default function createRootReducer() {
  return combineReducers({
    ui,
    modules,
    moduleStates,
    failedModules,
    activeAppModuleName,
    moduleDownloads,
    featuredModules,
  });
}
