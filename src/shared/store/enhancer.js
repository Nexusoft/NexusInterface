import { applyMiddleware } from 'redux';

import { localStorageKey } from 'lib/username';
import localStorageMiddleware from './localStorageMiddleware';

export default applyMiddleware(
  localStorageMiddleware(localStorageKey, (state) => state?.usernameByGenesis)
);
