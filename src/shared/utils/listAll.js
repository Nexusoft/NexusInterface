import { apiPost } from 'lib/tritiumApi';

export default async function listAll(endpoint, params, limit = 100) {
  let list = [];
  let results = null;
  let page = 0;
  do {
    results = await apiPost(endpoint, { ...params, limit, page: page++ });
    if (!results) break;
    if (Array.isArray(results)) {
      list = list.concat(results);
    } else {
      console.log(results);
      throw new Error(
        `API result is expected to be an array, got ${typeof results}`
      );
    }
  } while (results.length === limit);
  return list;
}
