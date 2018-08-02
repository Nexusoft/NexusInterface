import { createStore, applyMiddleware, compose } from "redux";
import { createBrowserHistory } from "history";
import { routerMiddleware } from "react-router-redux";
import thunk from "redux-thunk";
import rootReducer from "../reducers";

const history = createBrowserHistory();
// const router = routerMiddleware(history);
// const enhancer = applyMiddleware(router);

const middleware = [];
const enhancers = [];

middleware.push(thunk);
const router = routerMiddleware(history);
middleware.push(router);

enhancers.push(applyMiddleware(...middleware));
const enhancer = compose(...enhancers);

const store = createStore(rootReducer, enhancer);

export default { store, history };
