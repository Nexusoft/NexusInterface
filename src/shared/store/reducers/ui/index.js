import { combineReducers } from 'redux';

import modals from './modals';
import notifications from './notifications';
import backgroundTasks from './backgroundTasks';

export default combineReducers({
  modals,
  notifications,
  backgroundTasks,
});
