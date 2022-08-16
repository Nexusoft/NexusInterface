import { applyMiddleware } from 'redux';

import { localStorageKey } from 'lib/session';
import localStorageMiddleware from './localStorageMiddleware';

export default applyMiddleware(
  localStorageMiddleware(localStorageKey, (state) => state?.sessionCache)
);
