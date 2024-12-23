import { combineReducers } from 'redux';

import difficulty from './difficulty';
import systemInfo from './systemInfo';
import config from './config';

export default combineReducers({
  difficulty,
  systemInfo,
  config,
});
