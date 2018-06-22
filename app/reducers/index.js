import { combineReducers } from "redux";
import { routerReducer } from "react-router-redux";

import common from "./common";
import listReducer from "./listReducer";

const rootReducer = combineReducers({
  common,
  routerReducer,
  listReducer
});

export default rootReducer;
