import { combineReducers } from 'redux';

import lastActiveTab from './lastActiveTab';
import console from './console';

export default combineReducers({ lastActiveTab, console });
