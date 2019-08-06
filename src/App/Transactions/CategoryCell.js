import { connect } from 'react-redux';

import { categoryText } from './utils';
import { isPending } from 'lib/transactions';

const CategoryCell = ({ transaction, minConfirmations }) =>
  isPending(transaction, minConfirmations)
    ? `${__('Pending')} (${transaction.confirmations}/${minConfirmations})`
    : categoryText(transaction.category);

const mapStateToProps = ({ settings: { minConfirmations } }) => ({
  minConfirmations,
});

export default connect(mapStateToProps)(CategoryCell);
