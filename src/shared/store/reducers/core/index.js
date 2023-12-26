import { combineReducers } from 'redux';

import autoConnect from './autoConnect';
import difficulty from './difficulty';
import systemInfo from './systemInfo';
import ledgerInfo from './ledgerInfo';
import config from './config';

export default combineReducers({
  autoConnect,
  difficulty,
  systemInfo,
  ledgerInfo,
  config,
});
