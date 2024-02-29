import { callAPI } from 'lib/api';

export default async function listAll(endpoint, params, options = {}) {
  options = {
    limit: 100,
    callback: () => {},
    ...options,
  };
  let list = [];
  let results = null;
  let page = 0;
  do {
    results = await callAPI(endpoint, {
      ...params,
      limit: options.limit,
      page: page++,
    });
    if (!results) break;
    if (Array.isArray(results)) {
      options.callback?.(results);
      list = list.concat(results);
    } else {
      throw new Error(
        `API result is expected to be an array, got ${typeof results}`
      );
    }
  } while (results.length === options.limit);
  return list;
}
