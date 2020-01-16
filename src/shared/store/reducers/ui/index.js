import { combineReducers } from 'redux';

import addressBook from './addressBook';
import settings from './settings';
import console from './console';
import modals from './modals';
import notifications from './notifications';
import backgroundTasks from './backgroundTasks';
import closing from './closing';
import transactions from './transactions';
import transactionsTritium from './transactionsTritium';
import user from './user';
import invoices from './invoices';

export default combineReducers({
  addressBook,
  settings,
  console,
  modals,
  notifications,
  backgroundTasks,
  closing,
  transactions,
  transactionsTritium,
  user,
  invoices,
});
