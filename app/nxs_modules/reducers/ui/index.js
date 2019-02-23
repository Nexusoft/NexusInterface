import { combineReducers } from 'redux';

import addressBook from './addressBook';
import settings from './settings';

export default combineReducers({ addressBook, settings });
