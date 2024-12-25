import { combineReducers } from 'redux';

import session from './session';
import balances from './balances';
import accounts from './accounts';
import transactions from './transactions';
import tokens from './tokens';
import nameRecords from './nameRecords';
import namespaces from './namespaces';
import assets from './assets';

export default combineReducers({
  session,
  balances,
  accounts,
  transactions,
  tokens,
  nameRecords,
  namespaces,
  assets,
});
