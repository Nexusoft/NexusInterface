import { combineReducers } from "redux";
import { routerReducer } from "react-router-redux";

import overview from "./overview";
import list from "./list";
import market from "./market";
import common from "./common";

const rootReducer = combineReducers({
  overview,
  routerReducer,
  list,
  common,
  market
});

export default rootReducer;
