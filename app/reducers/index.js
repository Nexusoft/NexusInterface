import { combineReducers } from "redux";
import { routerReducer } from "react-router-redux";

import common from "./common";
import list from "./list";
import market from "./market";
import transactions from "./transactions";

const rootReducer = combineReducers({
  common,
  routerReducer,
  list,
  market,
  transactions
});

export default rootReducer;
