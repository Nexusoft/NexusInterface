__ = __context('Transactions');

export const categoryText = (category) => {
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
    case 'orphan':
      return __('Orphan');
    default:
      return __('Unknown');
  }
};

const fakeTxs = [];

export const getFakeTransactions = (accounts) => {
  if (!fakeTxs.length) {
    for (let i = 0; i < 160; i++) {
      fakeTxs.push(newFakeTx(accounts));
    }
  }
  return fakeTxs;
};

const enumRandom = (arr) => {
  const index = Math.floor(Math.random() * arr.length);
  return arr[index];
};

const newFakeTx = (accounts) => {
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

export const saveCSV = (transactions) => {
  const nameRow = [
    'Number',
    'Account',
    'Address',
    'Amount',
    'Type',
    'Time',
    'Transaction ID',
    'Confirmations',
    'Fee',
  ].join(',');

  const formatter = new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const sortedTransactions = [...transactions].sort(
    (tx1, tx2) => tx1.time - tx2.time
  );
  const rows = [
    nameRow,
    ...sortedTransactions.map((tx, i) =>
      [
        i + 1,
        tx.account,
        tx.address,
        tx.amount,
        tx.category,
        formatter.format(tx.time * 1000).replace(/,/g, ''),
        tx.txid,
        tx.confirmations,
        tx.fee || 0,
      ].join(',')
    ),
  ];

  const csvContent = `data:text/csv;charset=utf-8,${rows.join('\r\n')}`;
  const encodedUri = encodeURI(csvContent); // Set up a uri, in Javascript we are basically making a Link to this file
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', 'nexus-transactions.csv'); // give link an action and a default name for the file. MUST BE .csv

  document.body.appendChild(link); // Required for FF
  link.click(); // Finish by "Clicking" this link that will execute the download action we listed above
  document.body.removeChild(link);
};
