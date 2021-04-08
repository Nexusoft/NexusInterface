import * as TYPE from 'consts/actionTypes';
import store from 'store';
import { callApi } from 'lib/tritiumApi';

export async function fetchTokenDecimals(tokenAddresses) {
  const { tokenDecimals } = store.getState();
  const addresses = (Array.isArray(tokenAddresses)
    ? tokenAddresses
    : [tokenAddresses]
  ).filter((address) => tokenDecimals[address] !== undefined);
  const tokens = await Promise.all(
    addresses.map((address) => callApi('tokens/get/token', { address }))
  );
  store.dispatch({
    type: TYPE.SET_TOKEN_DECIMALS,
    payload: tokens.map(({ address, decimals }) => ({ address, decimals })),
  });
}
