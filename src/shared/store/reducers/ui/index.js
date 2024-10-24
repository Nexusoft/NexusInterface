import { combineReducers } from 'redux';

import addressBook from './addressBook';
import settings from './settings';
import console from './console';
import modals from './modals';
import notifications from './notifications';
import backgroundTasks from './backgroundTasks';
import closing from './closing';
import locked from './locked';
import transactionsFilter from './transactionsFilter';
import user from './user';

export default combineReducers({
  addressBook,
  settings,
  console,
  modals,
  notifications,
  backgroundTasks,
  closing,
  locked,
  transactionsFilter,
  user,
});
