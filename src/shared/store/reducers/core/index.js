import { combineReducers } from 'redux';

import difficulty from './difficulty';
import config from './config';

export default combineReducers({
  difficulty,
  config,
});
