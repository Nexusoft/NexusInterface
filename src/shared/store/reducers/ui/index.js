import { combineReducers } from 'redux';

import addressBook from './addressBook';
import settings from './settings';
import console from './console';
import modals from './modals';
import notifications from './notifications';
import backgroundTasks from './backgroundTasks';
import closing from './closing';
import transactionsFilter from './transactionsFilter';
import user from './user';
import transactions from './transactions';

export default combineReducers({
  addressBook,
  settings,
  console,
  modals,
  notifications,
  backgroundTasks,
  closing,
  transactionsFilter,
  user,
  transactions,
});
