import { combineReducers } from 'redux';

import difficulty from './difficulty';
import systemInfo from './systemInfo';
import ledgerInfo from './ledgerInfo';
import config from './config';

export default combineReducers({
  difficulty,
  systemInfo,
  ledgerInfo,
  config,
});
