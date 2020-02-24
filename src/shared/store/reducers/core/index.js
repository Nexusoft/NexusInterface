import { combineReducers } from 'redux';

import autoConnect from './autoConnect';
import info from './info';
import difficulty from './difficulty';
import systemInfo from './systemInfo';
import miningInfo from './miningInfo';
import config from './config';

export default combineReducers({
  autoConnect,
  info,
  difficulty,
  systemInfo,
  miningInfo,
  config,
});
