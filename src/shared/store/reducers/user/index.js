import { combineReducers } from 'redux';

import status from './status';
import stakeInfo from './stakeInfo';
import balances from './balances';
import accounts from './accounts';
import transactions from './transactions';
import tokens from './tokens';
import nameRecords from './nameRecords';
import namespaces from './namespaces';
import assets from './assets';
import assetSchemas from './assetSchemas';

export default combineReducers({
  status,
  stakeInfo,
  balances,
  accounts,
  transactions,
  tokens,
  nameRecords,
  namespaces,
  assets,
  assetSchemas,
});
