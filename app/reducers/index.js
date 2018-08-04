import { combineReducers } from "redux";
import { routerReducer } from "react-router-redux";

import overview from "./overview";
import list from "./list";
import market from "./market";
import transactions from "./transactions";
import common from "./common";
import login from "./login";
import exchange from "./exchange";

const rootReducer = combineReducers({
  overview,
  routerReducer,
  list,
  login,
  market,
  transactions,
  common,
  exchange
});

export default rootReducer;
