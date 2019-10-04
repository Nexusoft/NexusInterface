import { configureStore } from './configureStore';
import createObserver from './createObserver';
import getInitialState from './getInitialState';

const initialState = getInitialState();
const store = configureStore(initialState);

export const observeStore = createObserver(store);

export default store;
