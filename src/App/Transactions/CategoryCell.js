import { connect } from 'react-redux';

import { categoryText, isPending } from './utils';

const CategoryCell = ({ transaction, minConfirmations }) =>
  isPending(transaction, minConfirmations)
    ? `${__('Pending')} (${transaction.confirmations}/${minConfirmations})`
    : categoryText(transaction.category || transaction.details[0].category);

const mapStateToProps = ({ settings: { minConfirmations } }) => ({
  minConfirmations,
});

export default connect(mapStateToProps)(CategoryCell);
