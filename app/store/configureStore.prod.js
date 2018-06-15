import { createStore, applyMiddleware } from "redux";
import { createBrowserHistory } from "history";
import { routerMiddleware } from "react-router-redux";
import rootReducer from "../reducers";

const history = createBrowserHistory();
const router = routerMiddleware(history);
const enhancer = applyMiddleware(router);

const store = createStore(rootReducer, enhancer);

export default { store, history };
