export const categoryText = category => {
  switch (category) {
    case 'credit':
    case 'receive':
      return __('Receive');
    case 'debit':
    case 'send':
      return __('Send');
    case 'genesis':
      return __('Genesis');
    case 'trust':
      return __('Trust');
    case 'generate':
      return __('Generate');
    case 'immature':
      return __('Immature');
    case 'stake':
      return __('Stake');
    case 'Pending':
      return __('(Pending)');
    case 'orphan':
      return __('Orphan');
    default:
      return __('Unknown');
  }
};

const fakeTxs = [];

export const getFakeTransactions = accounts => {
  if (!fakeTxs.length) {
    for (let i = 0; i < 160; i++) {
      fakeTxs.push(newFakeTx(accounts));
    }
  }
  return fakeTxs;
};

const enumRandom = arr => {
  const index = Math.floor(Math.random() * arr.length);
  return arr[index];
};

const newFakeTx = accounts => {
  const acc = enumRandom(accounts);
  const category = enumRandom(['receive', 'debit', 'stake', 'genesis']);
  const now = new Date();
  const startDate = new Date(now.getFullYear() - 1, 1, 1);
  const time = new Date(
    startDate.getTime() + Math.random() * (now.getTime() - startDate.getTime())
  );

  return {
    account: acc && acc.account,
    address: '1111111111111111111111111111111',
    category,
    amount: (Math.random() * 1000).toFixed(5) * (category === 'debit' ? -1 : 1),
    confirmations: Math.ceil(Math.random() * 10),
    blockindex: Math.ceil(Math.random() * 10),
    txid: '00000000000000000000000000000000000000000',
    time: time.getTime() / 1000,
    fake: true,
  };
};

export const isPending = (tx, minConf) =>
  !!minConf && tx.confirmations < Number(minConf) && tx.category !== 'orphan';
