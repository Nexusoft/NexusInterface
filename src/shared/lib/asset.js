import { apiPost } from 'lib/tritiumApi';
import store from 'store';
import * as TYPE from 'consts/actionTypes';

export async function fetchAssetSchema(address) {
  const schema = await apiPost('assets/get/schema', { address });
  store.dispatch({
    type: TYPE.SET_ASSET_SCHEMA,
    payload: {
      address,
      schema,
    },
  });
}
