import { combineReducers } from 'redux';

import lastActiveTab from './lastActiveTab';
import console from './console';
import core from './core';

export default combineReducers({ lastActiveTab, console, core });
