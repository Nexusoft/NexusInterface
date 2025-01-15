import createStore from './createStore';
import createObserver from './createObserver';

const initialState = {};
const store = createStore(initialState);

export const observeStore = createObserver(store);

export default store;

export {
  jotaiStore,
  subscribe,
  subscribeWithPrevious,
  queryClient,
  Providers,
  jotaiQuery,
} from './jotai';
