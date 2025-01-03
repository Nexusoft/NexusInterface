import { combineReducers } from 'redux';

import session from './session';
import nameRecords from './nameRecords';
import namespaces from './namespaces';
import assets from './assets';

export default combineReducers({
  session,
  nameRecords,
  namespaces,
  assets,
});
