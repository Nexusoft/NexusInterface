import createStore from './createStore';
import createObserver from './createObserver';
import getInitialState from './getInitialState';

const initialState = getInitialState();
const store = createStore(initialState);

export const observeStore = createObserver(store);

export default store;

export {
  jotaiStore,
  subscribe,
  subscribeWithPrevious,
  queryClient,
  Providers,
} from './jotai';
