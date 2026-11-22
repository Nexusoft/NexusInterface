import { combineReducers } from 'redux';

import autoConnect from './autoConnect';
import connectionFailed from './connectionFailed';
import difficulty from './difficulty';
import systemInfo from './systemInfo';
import ledgerInfo from './ledgerInfo';
import config from './config';

export default combineReducers({
  autoConnect,
  connectionFailed,
  difficulty,
  systemInfo,
  ledgerInfo,
  config,
});
