import { combineReducers } from "redux";
import { routerReducer } from "react-router-redux";

import common from "./common";
import list from "./list";

const rootReducer = combineReducers({
  common,
  routerReducer,
  list
});

export default rootReducer;
