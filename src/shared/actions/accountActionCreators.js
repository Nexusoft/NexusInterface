import * as RPC from 'lib/rpc';
import * as TYPE from './actiontypes';

// Nexus core can only handle an amount of RPC requests at the same time
// So we make the requests in batches to avoid the errors
async function batchPromises(list, toPromise, batchSize = 3) {
  let results = [];
  while (list.length) {
    const batch = list.splice(0, batchSize);
    results = results.concat(await Promise.all(batch.map(toPromise)));
  }
  return results;
}

export const loadMyAccounts = () => async dispatch => {
  const accList = await RPC.PROMISE('listaccounts', []);
  const accounts = Object.keys(accList);
  const addrList = await batchPromises(accounts, account =>
    RPC.PROMISE('getaddressesbyaccount', [account])
  );

  let addresses = [];
  for (let addrs of addrList) {
    addresses = addresses.concat(addrs);
  }
  const validations = await batchPromises(addresses, address =>
    RPC.PROMISE('validateaddress', [address])
  );

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
