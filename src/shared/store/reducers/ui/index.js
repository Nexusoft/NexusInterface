import { combineReducers } from 'redux';

import addressBook from './addressBook';
import console from './console';
import modals from './modals';
import notifications from './notifications';
import backgroundTasks from './backgroundTasks';
import transactionsFilter from './transactionsFilter';

export default combineReducers({
  addressBook,
  console,
  modals,
  notifications,
  backgroundTasks,
  transactionsFilter,
});
