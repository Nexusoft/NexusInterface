import { combineReducers } from 'redux';

import autoConnect from './autoConnect';
import info from './info';
import difficulty from './difficulty';

export default combineReducers({ autoConnect, info, difficulty });
