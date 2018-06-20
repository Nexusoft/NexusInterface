import { combineReducers } from "redux-immutable";
import routerReducer from "./routerReducer";
import common from "./common";

const rootReducer = combineReducers({
  common,
  routerReducer
});

export default rootReducer;
