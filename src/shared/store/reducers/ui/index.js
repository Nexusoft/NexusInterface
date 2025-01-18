import { combineReducers } from 'redux';

import addressBook from './addressBook';
import modals from './modals';
import notifications from './notifications';
import backgroundTasks from './backgroundTasks';
import transactionsFilter from './transactionsFilter';

export default combineReducers({
  addressBook,
  modals,
  notifications,
  backgroundTasks,
  transactionsFilter,
});
