import { combineReducers } from "redux";
import { routerReducer } from "react-router-redux";

import overview from "./overview";
import list from "./list";
import market from "./market";

const rootReducer = combineReducers({
  overview,
  routerReducer,
  list,
  market
});

export default rootReducer;
