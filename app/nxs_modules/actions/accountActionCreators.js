import * as RPC from 'scripts/rpc';
import * as TYPE from './actiontypes';

export const loadMyAccounts = () => async dispatch => {
  const accList = await RPC.PROMISE('listaccounts', [0]);

  const addrList = await Promise.all(
    Object.keys(accList).map(account =>
      RPC.PROMISE('getaddressesbyaccount', [account])
    )
  );

  const validateAddressPromises = addrList.reduce(
    (list, element) => [
      ...list,
      ...element.addresses.map(address =>
        RPC.PROMISE('validateaddress', [address])
      ),
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
