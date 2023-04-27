import { combineReducers } from 'redux';

import autoConnect from './autoConnect';
import info from './info';
import difficulty from './difficulty';
import systemInfo from './systemInfo';
import ledgerInfo from './ledgerInfo';
import config from './config';

export default combineReducers({
  autoConnect,
  info,
  difficulty,
  systemInfo,
  ledgerInfo,
  config,
});
