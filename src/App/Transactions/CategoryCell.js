import { useSelector } from 'react-redux';

import { categoryText } from './utils';
import { isPending } from 'lib/transactions';

__ = __context('Transactions');

export default function CategoryCell({ transaction }) {
  const minConfirmations = useSelector(
    (state) => state.settings.minConfirmations
  );

  return isPending(transaction, minConfirmations)
    ? `${__('Pending')} (${transaction.confirmations}/${minConfirmations})`
    : categoryText(transaction.category);
}
