export const categoryText = inData => {
  switch (inData.category) {
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
