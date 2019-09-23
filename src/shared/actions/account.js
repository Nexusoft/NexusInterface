import rpc from 'lib/rpc';
import { apiPost } from 'lib/tritiumApi';
import * as TYPE from 'consts/actionTypes';

export const loadMyAccounts = () => async dispatch => {
  const accList = await rpc('listaccounts', []);

  const addrList = await Promise.all(
    Object.keys(accList || {}).map(account =>
      rpc('getaddressesbyaccount', [account])
    )
  );

  const validateAddressPromises = addrList.reduce(
    (list, element) => [
      ...list,
      ...element.map(address => rpc('validateaddress', [address])),
    ],
    []
  );
  const validations = await Promise.all(validateAddressPromises);

  const accountList = [];
  validations.forEach(e => {
    if (e.ismine && e.isvalid) {
      const index = accountList.findIndex(ele => ele.account === e.account);
      const indexDefault = accountList.findIndex(
        ele => ele.account === 'default'
      );

      if (e.account === '' || e.account === 'default') {
        if (index === -1 && indexDefault === -1) {
          accountList.push({
            account: 'default',
            addresses: [e.address],
          });
        } else {
          accountList[indexDefault].addresses.push(e.address);
        }
      } else {
        if (index === -1) {
          accountList.push({
            account: e.account,
            addresses: [e.address],
          });
        } else {
          accountList[index].addresses.push(e.address);
        }
      }
    }
  });

  accountList.forEach(acc => {
    const accountName = acc.account || 'default';
    if (accountName === 'default') {
      acc.balance =
        accList['default'] !== undefined ? accList['default'] : accList[''];
    } else {
      acc.balance = accList[accountName];
    }
  });

  dispatch({ type: TYPE.MY_ACCOUNTS_LIST, payload: accountList });
};

export const updateAccountBalances = () => async dispatch => {
  const accList = await rpc('listaccounts', []);
  dispatch({ type: TYPE.UPDATE_MY_ACCOUNTS, payload: accList });
};
