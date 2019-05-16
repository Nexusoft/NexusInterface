import { combineReducers } from 'redux';

import addressBook from './addressBook';
import settings from './settings';
import console from './console';

export default combineReducers({ addressBook, settings, console });
