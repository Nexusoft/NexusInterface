import { combineReducers } from "redux";
import { routerReducer } from "react-router-redux";

import common from "./common";
import list from "./list";
import market from "./market";

const rootReducer = combineReducers({
  common,
  routerReducer,
  list,
  market
});

export default rootReducer;
