import { combineReducers } from 'redux';

import autoConnect from './autoConnect';
import info from './info';
import difficulty from './difficulty';
import systemInfo from './systemInfo';
import stakeInfo from './stakeInfo';
import balances from './balances';
import userStatus from './userStatus';
import accounts from './accounts';

export default combineReducers({
  autoConnect,
  info,
  difficulty,
  systemInfo,
  stakeInfo,
  balances,
  userStatus,
  accounts,
});
