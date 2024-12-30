import { combineReducers } from 'redux';

import session from './session';
import balances from './balances';
import accounts from './accounts';
import tokens from './tokens';
import nameRecords from './nameRecords';
import namespaces from './namespaces';
import assets from './assets';

export default combineReducers({
  session,
  balances,
  accounts,
  tokens,
  nameRecords,
  namespaces,
  assets,
});
