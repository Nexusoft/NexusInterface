import { callApi } from 'lib/tritiumApi';

export default async function listAll(endpoint, params, limit = 100, startPage = 0,additems = () => {}) {
  let list = [];
  let results = null;
  let page = startPage;
  do {
    results = await callApi(endpoint, { ...params, limit, page: page++ });
    if (!results) break;
    if (Array.isArray(results)) {
      additems(results);
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
