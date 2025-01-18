import { combineReducers } from 'redux';

import ui from './ui';

export default function createRootReducer() {
  return combineReducers({
    ui,
  });
}
