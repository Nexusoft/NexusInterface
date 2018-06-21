import { combineReducers } from "redux-immutable";
import routerReducer from "./routerReducer";
import common from "./common";
import listReducer from "./listReducer";

const rootReducer = combineReducers({
  common,
  routerReducer,
  listReducer
});

export default rootReducer;
