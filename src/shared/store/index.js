import { configureStore, history } from './configureStore';
import createObserver from './createObserver';

export { configureStore, history };

const store = configureStore();

export const observeStore = createObserver(store);

export default store;
